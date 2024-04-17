APP START DOCUMENTATION

In order to run the server and get the application to run follow the following steps: 

1. Prerequisites 
- Make sure you have Node.js installed on your machine 
- Install Node-oracledb
- Install Express
- Install @getbrevo/brevo

2. Running the Server
- Open up a terminal instance (Top of the screen -> Terminal -> New Terminal)
- Run the command node server.js
- You should see 'Server running on http://localhost:3000' and http://localhost:465/ in the console 
- Now you can double click on the HTML files and use the application as normal and the app should work

3. Adding a SQL call 
- Call the method executeSQL(query) and pass in a SQL query
- This will return a response. To handle the response use this code: 

executeSQL(QUERY)
    .then(
        rows => {
            console.log(rows);
            
            //Add additional post-query logic here if necessary
    })
    .catch(error => console.error('Error:', error));