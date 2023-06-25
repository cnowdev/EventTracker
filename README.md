# EventTracker
A Project for FBLA NLC 2023.

## Getting Started

1. Configure the .ENV file with Firestore project settings and a custom dashboard color.
   - Get Firebase config settings from firebase.google.com and input hex data for the dashboard color.

2. Create a new user in the Authentication tab of Firebase. Only input an email and password.

3. Copy the UID from the user you just created and create a new collection in Firestore named 'users.' Create a document with the copied UID and set the following fields for this user:
   - admin (boolean): true
   - gpa (number): 0
   - grade (number): 0
   - points (number): 0
   - name (string): admin

4. Complete! Sign in as the user you've created and create student accounts!
