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

exports.createUserAccount = onCall((request, response) => {
    const email = request.data.email;
    const password = request.data.password;
    const gpa = request.data.gpa;
    const grade = request.data.grade;
    const uid = request.auth.uid;

    logger.info({email: email, password: password, uid: uid, gpa: gpa, grade: grade});   
    

    try{
        
    }catch(e){
        logger.error(e);
    }
    return 'data received';
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
