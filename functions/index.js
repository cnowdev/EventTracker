/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest, onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const bodyParser = require("body-parser");

const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {getAuth} = require("firebase-admin/auth");

initializeApp();

const firestore = getFirestore();
const auth = getAuth();

exports.createUserAccount = onCall((request) => {
    const email = request.data.email;
    const password = request.data.password;
    const gpa = request.data.gpa;
    const grade = request.data.grade;
    const uid = request.auth.uid;
    const name = request.data.name;
    const admin = request.data.admin;

    logger.info({email: email, password: password, uid: uid, gpa: gpa, grade: grade, name: name, admin: admin});   
    

    try{
         return auth.createUser({
            email: email,
            password: password
        }).then((userRecord) => {
            logger.info("Successfully created new user:", userRecord.uid);
            return firestore.collection("users").doc(userRecord.uid).set({
                gpa: gpa,
                grade: grade,
                name: name,
                admin: admin,
                points: 0
            }).then(() => {
                logger.info("Successfully created new user document");
                return {status: 'complete', message: "Successfully created new user document"};
            }).catch((error) => {
                logger.error("Error creating new user document: ", error);
                return {status: 'error', message: "Error creating new user document"};
            });
        }).catch((error) => {
            logger.error("Error creating new user:", error);
            return {status: 'error', message: "Error creating new user"};
        });
    }catch(e){
        logger.error(e);
    }
    
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
