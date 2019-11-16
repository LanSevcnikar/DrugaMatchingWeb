const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const moment = require('moment');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'drugamatcher@gmail.com',
        pass: 'beepboop321'
    }
});

function extractname(email) {
    var myR = /^[A-Za-z].*?\./;
    var name = myR.exec(email)[0];
    return (name[0].toUpperCase() + name.substring(1, name.length - 1).toLowerCase());
}

exports.OnUpdateOfCrush = functions.firestore.document('Users/{userId}').onUpdate((change, context) => {
    const after = change.after.data().crushes;
    const before = change.before.data().crushes;
    const userId = context.params.userId;
    const newArr = after.filter(el => {
        return before.indexOf(el) < 0;
    })
    let promises = [];
    newArr.forEach(element => {
        promises.push(db.doc('Users/' + element).get()
            .then(doc => {
                if (doc.exists) {
                    const theirCrushes = doc.data().crushes;
                    if (theirCrushes.indexOf(userId) !== -1) {
                        return db.collection("EmailTemplates").get().then(snapshot => {
                            let maxN = snapshot.size;
                            let randN = Math.floor(Math.random() * maxN);
                            let i = 0;
                            let promises = [];
                            snapshot.forEach(doc => {
                                if (i === randN) {
                                    console.log(doc.id, ' => ', doc.data(), '   Was the email temple chosen')
                                    var email1 = element;
                                    var name1 = extractname(email1);
                                    var email2 = userId;
                                    var name2 = extractname(email2);
                                    var toList = [email1, email2];
                                    const mail = {
                                        from: "LoverBoy <yaboi@gmail.com",
                                        to: toList,
                                        subject: 'DrugaMatching - Kako adorable',
                                        html: ''
                                    }
                                    let message = doc.data().html
                                    let body = '<p>' + name1 + ' + ' + name2 + '?</p><br><p>' + message + '</p><br><br>' + email1 + '<br>' + email2;
                                    mail.html = body;
                                    console.log(body);
                                    let prom = [];
                                    try {
                                        prom.push(transporter.sendMail(mail));
                                    }
                                    catch (err) {
                                        console.log("couldn't send email")
                                    }
                                    console.log("There was a match between " + email1 + " and " + email2);
                                    promises.push(Promise.all(prom));
                                }
                                i++;
                            })
                            return Promise.all(promises);
                        })

                    } else {
                        console.log(email2 + " wrote " + email1 + " but didn't match");
                        return Promise();
                    }
                } else {
                    console.log(userId + " wrote " + doc + " but didn't match because the other one does not exist");
                    return new Promise();
                }
            }).catch(err => {
                console.log(err)
            }))
    });
    return Promise.all(promises);
});

exports.ResetInSeptember =
    functions.pubsub
        .schedule('00 09 16 11 *')
        .onRun((context) => {
            var promises = [];
            const year = parseInt(moment().format('YY'));
            mails = [];
            //mails.push('lan.sevcnikar@druga.si');
            for (let index = 0; index !== 4; index++) {
                mails.push((year - index) + 'a_dijaki@druga.si');
                mails.push((year - index) + 'b_dijaki@druga.si');
                mails.push((year - index) + 'c_dijaki@druga.si');
                mails.push((year - index) + 'd_dijaki@druga.si');
                mails.push((year - index) + 'e_dijaki@druga.si');
                mails.push((year - index) + 'f_dijaki@druga.si');
                mails.push((year - index) + 's_dijaki@druga.si');
            }
            mails.push((year - 2) + 'mm_dijaki@druga.si');
            mails.push((year - 3) + 'mm_dijaki@druga.si');
            const mailOptions = {
                from: "LoverBoy <yaboi@gmail.com",
                to: mails,
                subject: 'DrugaMatching',
                html: htmlResetEmail,
            };

            promises.push(deleteUsers());
            promises.push(deleteCollection('Users', 50));
            promises.push(transporter.sendMail(mailOptions, (erro, info) => {
                if (erro) {
                    console.log(erro.toString());
                } else {
                    console.log('Sended mail')
                }
            }));
            return Promise.all(promises);
        });

function deleteCollection(collectionPath, batchSize) {
    var query = db.collection(collectionPath).orderBy('__name__').limit(batchSize)

    return new Promise(function (resolve, reject) {
        deleteQueryBatch(query, batchSize, resolve, reject)
    })
}

function deleteQueryBatch(query, batchSize, resolve, reject) {
    query.get()
        .then((snapshot) => {
            // When there are no documents left, we are done
            if (snapshot.size === 0) {
                return 0
            }

            // Delete documents in a batch
            var batch = db.batch()
            snapshot.docs.forEach(function (doc) {
                batch.delete(doc.ref)
            })

            return batch.commit().then(function () {
                return snapshot.size
            })
        }).then(function (numDeleted) {
            if (numDeleted <= batchSize) {
                resolve()
                return
            }
            else {
                // Recurse on the next process tick, to avoid
                // exploding the stack.
                return process.nextTick(function () {
                    deleteQueryBatch(query, batchSize, resolve, reject)
                })
            }
        })
        .catch(reject)
}

function deleteUsers(nextPageToken) {
    return admin.auth().listUsers(1000, nextPageToken)
        .then(function (listUsersResult) {
            var promises = [];
            listUsersResult.users.forEach(function (userRecord) {

                //console.log("user", userRecord.toJSON());
                promises.push(admin.auth().deleteUser(userRecord.uid)
                    .then(function () {
                        console.log("Successfully deleted user");
                        return Promise();
                    })
                    .catch(function (error) {
                        console.log("Error deleting user:", error);
                    }));

            });
            if (listUsersResult.pageToken) {
                promises.push(deleteUsers(listUsersResult.pageToken));
            }
            return Promise.all(promises);
        })
        .catch(function (error) {
            console.log('Error deleting users:', error);
        });
}

exports.onCreatingUser = functions.auth.user().onCreate((user) => {
    if (user.email.endsWith('@druga.si')) {
        console.log(user.email + 'made an account')
        var Ref = 'Users/' + user.email;
        var promises = [];
        promises.push(
            db.collection('Users').doc(user.email).set({
                crushes: []
            }));
        return Promise.all(promises);
    } else {
        console.log('A non druga account has been added')
        return admin.auth().deleteUser(user.uid)
            .catch(function () {
                console.log('couldnt delete ' + user.email)
            })
    }


});

const htmlResetEmail = `<p>
Moje drage introvertirane ovčke!
</p>
<br>
<p>
Tukaj sem, da vas odrešim vseh vaših muk in trepljenja. Novo leto
je čas, da se začnejo nove ljubezni. Nove romance, novi odnosi, nova spoznanja
</p>
<p>
A kot smo ugotovili, imamo težavo. Vsi ste introvertirani v *** ***** *******, tako da je
potrebno pomoči. Naša šola ima že leta, za vsako Valentinovo,
aplikacijo, na kateri lahko vpišeš svojo ljubezen in v kolikor vpišejo tudi oni vašo, potem je
pač kiss kiss time. Če pa ne, pa noben ne izve nič o tem. A zakaj bi bilo to na voljo samo za Valentinovo?
Zdaj ni več omejeno samo na valentinovo, introducing:
<p>
    <a href="drugamatching.com" style="font-size: 25px">drugamatching.com</a>
</p>
made by me. Hope you like it.
</p>
<p>
Deluje na enakem principu kakor aplikacija za Valentinovo. Vpiši email svoje drage/dragega in v
kolikor oni vpišejo tudi vaš email, potem bosta
obadva dobila email, da bosta izvedla o skupnem "všečkanju". V kolikor pa je ljubezen enostranska 
ali pa druga oseba ne vpiše vašega emaila zaradi katerega koli razloga,
ne bo mogla nikoli izvedeti, da ti je všeč.
</p>
<p>
PS: Vsakič, ko se ta email pošlje se aplikacija sama resetira, kar pomeni, da karkoli ste vpisali do tedaj izgine
<br>
Za dodatna vprašanja se najdejo odgovori na spletni strani pod zavihki <i>o meni</i> in <i>help</i>, a v kolikor se na vprašanje
ne da tam odgovoriti ali bi radi se pritožili ali pomagali, pišite na email <i>beepbooprobotlan@gmail.com</i>.
<br>
Donacije sprejemam tudi v obliki kave.
</p>
<br>
<p>
Uživajte,
<br>
Nekdo s fejst preveč časa,
<br>
II. gimnazija Maribor.
</p>
`
