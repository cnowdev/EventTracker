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

//get firestore and admin auth admin SDKs
const firestore = getFirestore();
const auth = getAuth();

exports.createUserAccount = onCall((request) => {
    //get all required data from request
    const email = request.data.email;
    const password = request.data.password;
    const gpa = request.data.gpa;
    const grade = request.data.grade;
    const uid = request.auth.uid;
    const name = request.data.name;
    const admin = request.data.admin;

    //logger.info({email: email, password: password, uid: uid, gpa: gpa, grade: grade, name: name, admin: admin});   
    

    try{
        //Create a user in firebase auth
         return auth.createUser({
            email: email,
            password: password            
        })
        //If user is succesfully added to firebase auth, add that user to firestore
        .then((userRecord) => {
            logger.info("Successfully created new user:", userRecord.uid);
            return firestore.collection("users").doc(userRecord.uid).set({
                gpa: gpa,
                grade: grade,
                name: name,
                admin: admin,
                points: 0
            })
            //if the user is sucessfully added to firestore, return sucess message that we were able to create the user
            .then(() => {
                logger.info("Successfully created new user document");
                return {status: 'complete', message: "Successfully created new user document"};
            })
            //if there was an error adding the user to firestore, return error message
            .catch((error) => {
                logger.error("Error creating new user document: ", error);
                return {status: 'error', message: "Error creating new user document"};
            });
        })
        // if there was an error adding user to firebase, return error message.
        .catch((error) => {
            logger.error("Error creating new user:", error);
            return {status: 'error', message: "Error creating new user"};
        });
    }catch(e){
        //also log an error to firebase functions log
        logger.error(e);
    }
    
});


exports.importUserData = onCall((request) => {

    //write batch so we can commit all users at once
    const writeBatch = firestore.batch();

    //get all user data from request
    const userData = request.data.userData;

    //boolean to check if there was an error with a user already existing
    let alreadyExistError = false;

    //create a promise for each user to create a user in firebase auth
    const createUserPromise = userData.map((user) => {
        return auth.createUser({
            email: user.email,
            password: user.password
        })
        //if the user was sucessfully created in firebase auth, add that user to our firestore write  batch
        .then((userRecord) => {
            let userAdminStatus = false;
            if(user.admin === 'true') { userAdminStatus = true;}
            writeBatch.set(firestore.collection('users').doc(userRecord.uid), {
                admin: userAdminStatus,
                gpa: parseFloat(user.gpa),
                grade: parseInt(user.grade),
                name: user.name,
                points: parseInt(user.points)
            });
        })
        //if there was an error creating a user, check if the error was that the user already exists. If it wasn't an error where the user already exists, throw an error to be caught later
        .catch((error) => {
            if(error.code = 'auth/email-already-exists'){
                console.log('user already exists');
                alreadyExistError = true;
                return;
            } else {
                throw error;
            }
        });
    });

    //once all users have been created in firebase auth, commit the write batch to firestore
    return Promise.all(createUserPromise).then(() => {
        return writeBatch.commit();
    }).then(() => {
        return { status: 'complete', message: 'Awesome!', alreadyExistError: alreadyExistError}
    }).catch((e) => {
        console.log(e.code);
        return {status: 'error', message: 'error:' + e.message, alreadyExistError: alreadyExistError}
    });


    /*
    
    const writeBatch = firestore.batch();
    const userData = request.data.userData;
    let response;
    let itemsProcessed = 0;
    return userData.forEach((user, index, array) => {
        return auth.createUser({
            email: user.email,
            password: user.password
        }).then((userRecord) => {
                return writeBatch.set(firestore.collection('users').doc(userRecord.uid), {
                admin: user.admin,
                gpa: parseInt(user.gpa),
                grade: parseInt(user.grade),
                name: user.name,
                points: user.points
            });
        }).then(async() => {
            itemsProcessed++;
            if(itemsProcessed === array.length){
                try{
                    await writeBatch.commit();
                    
                    return {status: 'complete', message: 'Lets GOO!'}
                }catch(e){
                    return {status: 'error', message: 'error :('}
                }
                
            }
        });
        
        
    });


    */
})

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
