const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors'); // Import the cors package
const { sendEmailsNew } = require('./email.js');
const { sendResultEmailFromServer } = require('./email.js');
const path = require('path'); // Import the path module
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Use the cors middleware
app.use(cors());

app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname)));

// Database connection configuration
const dbConfig = {
    user: 'ADMIN',
    password: 'Password1234',
    connectString: '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.us-chicago-1.oraclecloud.com))(connect_data=(service_name=g56584dbca20ce4_tbsurveydbcloud_medium.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'
};

// Endpoint to execute SQL queries
app.get('/executeQuery', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // Allow specified methods
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow specified headers
    // Your route handler logic
    console.log('REQ SQL: ' + req.query.sql);
    console.log('Received request to execute SQL query');
    try {
        console.log('Attempting to establish database connection');
        const connection = await oracledb.getConnection(dbConfig);
        console.log('Connected to the database');
        const result = await connection.execute(req.query.sql);
        console.log('Executed SQL query successfully');

        if (result.rowsAffected !== undefined) {
            console.log('No rows returned (INSERT statement)');
            // If it's an INSERT statement, commit the transaction
            connection.commit();
            console.log('Transaction committed successfully');
        }

        let response = [];

        if (result.rowsAffected !== undefined) {
            console.log('No rows returned (INSERT statement)');
            // If it's an INSERT statement, return an empty array or an array with a success object
            response = [{ success: true }];
        } else {
            // Get column names from metadata
            const columnNames = result.metaData.map(column => column.name);

            // Transform the query result into an array of objects with dynamic property names
            response = result.rows.map(row => {
                const rowData = {};
                columnNames.forEach((columnName, index) => {
                    rowData[columnName] = row[index];
                });
                return rowData;
            });
        }

        res.json(response);

        await connection.close();
        console.log('Closed database connection');
    } catch (err) {
        console.error('Error executing SQL query:', err);
        res.status(500).send('Error executing SQL query');
    }
});

app.post('/send-results', async (req, res) => {
    console.log("EXECUTING SEND RESULTS ON SERVER")
    const { userId, result } = req.body;
    sendResultEmailFromServer(userId, result);
    res.status(200).json({ message: "Results received successfully."});
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
  
  app.listen(PORT, async () => {
      console.log(`Server running on http://localhost:${PORT}`);
      try {
          await sendEmailsNew();
      } catch (error) {
          console.error('Error calling send email function:', error);
      }
  });
