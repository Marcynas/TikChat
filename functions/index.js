const functions = require("firebase-functions");
const Filter = require('bad-words');

const admin = require('firebase-admin')
admin.initializeApp();

const db = admin.firestore();

exports.detectBadWords = functions.firestore
.document('messages/{msgId}')
.onCreate(async (snapshot, context) => {
    const { text ,uid } = snapshot.data();
    const filter = new Filter();
    if (filter.isProfane(text)) {
        const cleaned = filter.clean(text);
        await snapshot.ref.update({ text: cleaned });
    }
});