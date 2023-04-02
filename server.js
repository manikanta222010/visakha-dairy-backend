const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
dotenv.config()


const config = {
  server: process.env.SERVER,
  port: 1433,
  database: process.env.DATABASE,
  user: process.env.USER,
  password: process.env.PASSWORD,
  options: {
    encrypt: false // disable SSL
  }
};

app.use(cors());
app.use(express.json());

//////////////////////////



app.use(bodyParser.json());


function generateToken(user) {
  // const payload = {
  //   user_name: user.user_name,
  //   password: user.password,
  //   user_type: user.user_type,
  //   user_type_code: user.user_type_code
  // };

  return jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
}

app.post('/login', async (req, res) => {

  let pool = await sql.connect(config);
  let result = await pool.request().query(`SELECT * FROM USERS_MASTER WHERE user_name = '${req.body.user_name}' AND password = '${req.body.password}'`);

  if (result.recordset.length === 0) {
    return res.status(401).json({ message: 'Invalid Username or Password' });
  }

  const token = generateToken(result.recordset);
  res.json({ token });

});

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { user } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

app.get('/', verifyToken, async (req, res) => {
  try {
    const user = req.user
    res.send(user[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});



////////////////////////////////

// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization']
//   const token = authHeader && authHeader.split(' ')[1]
//   if (token == null) return res.sendStatus(401)

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     console.log(err)
//     if (err) return res.sendStatus(403)
//     req.user = user
//     next()
//   })
// }

// app.post('/login', async (req, res) => {

//   console.log("body: ", req.body)
//   try {
//     let pool = await sql.connect(config);
//     let result = await pool.request().query(`SELECT * FROM USERS_MASTER WHERE user_name = '${req.body.user_name}' AND password = '${req.body.password}'`);

//     const { user_name, password } = req.body;
//     console.log("-----", user_name, password)

//     const user = result.recordset
//     const exact = {user_access: user}
//     console.log(user);

//     const accessToken = jwt.sign(exact, process.env.ACCESS_TOKEN_SECRET)
//     res.json({ accessToken: accessToken })

//     // res.send(result.recordset);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send(err);
//   }
// });





// app.get('/users', authenticateToken, async (req, res) => {

//   let pool = await sql.connect(config);
//     let result = await pool.request().query(`SELECT * FROM HEAD_QUARTERS`);

//     const users = result.recordset
//     console.log("SAD1", users)
//     console.log("SAD2", req.user.user_access)

//     console.log("req: ", req.rawHeaders)
//   res.json(users)
// });

//////////////////////////////

app.get('/headquarters', verifyToken, async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query(`SELECT * FROM HEAD_QUARTERS`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/headquarters/:hqCode/bcc', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query(`SELECT ASSOCIATED_HQS.hq_code, HEAD_QUARTERS.hq_name, BCC.* FROM BCC INNER JOIN ASSOCIATED_HQS ON BCC.bcc_code = ASSOCIATED_HQS.bcc_code INNER JOIN HEAD_QUARTERS ON ASSOCIATED_HQS.hq_code = HEAD_QUARTERS.hq_code WHERE ASSOCIATED_HQS.hq_code=${Number(req.params.hqCode)}`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/bcc', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query('SELECT TOP 300 * FROM BCC');
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/bcc/:username', async (req, res) => {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request().query(`SELECT * FROM ASSOCIATED_HQS_VW INNER JOIN USERS_MASTER ON ASSOCIATED_HQS_VW.bcc_code = USERS_MASTER.user_type_code where USERS_MASTER.user_name = '${req.params.username}'`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/bcc/:username/society', async (req, res) => {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request().query(`SELECT * FROM ASSOCIATED_HQS_VW INNER JOIN USERS_MASTER ON ASSOCIATED_HQS_VW.bcc_code = USERS_MASTER.bcc_code where USERS_MASTER.user_name = '${req.params.username}'`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});


app.get('/headquarters/:hqCode/bcc/:bccCode', async (req, res) => {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request().query(`SELECT * FROM BCC WHERE bcc_code = ${Number(req.params.bccCode)}`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/societies', async (req, res) => {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request().query(`SELECT * FROM SOCIETIES`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/headquarters/:hqCode/bcc/:bccCode/societies', async (req, res) => {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request().query(`SELECT * FROM SOCIETIES WHERE bcc_code = ${Number(req.params.bccCode)} ORDER BY society_code ASC`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/headquarters/:hqCode/bcc/:bccCode/societies/:societyCode', async (req, res) => {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request().query(`SELECT * FROM SOCIETIES WHERE bcc_code = ${Number(req.params.bccCode)} and society_code = ${Number(req.params.societyCode)}`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/headquarters/:hqCode/bcc/:bccCode/societies/:societyCode/producers', async (req, res) => {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request().query(`SELECT * FROM PRODUCERS WHERE bcc_code = ${Number(req.params.bccCode)} and society_code = ${Number(req.params.societyCode)} ORDER BY pno ASC`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/bcc/:bccCode/societies/:societyCode/producers/:fromDate/:toDate', async (req, res) => {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request().query(`SELECT DISTINCT producer_name, bcc_code, society_code, producer_no FROM MILK_RECEIPTS_FN_CONSOLIDATED WHERE bcc_code = ${Number(req.params.bccCode)} and society_code = ${Number(req.params.societyCode)} and from_date >= ${"'" + req.params.fromDate + " 00:00:00.000'"} and to_date <= ${"'" + req.params.toDate + " 00:00:00.000'"} ORDER BY producer_no`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/headquarters/:hqCode/bcc/:bccCode/societies/:societyCode/producers/:pno', async (req, res) => {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request().query(`SELECT * FROM PRODUCERS WHERE bcc_code = ${Number(req.params.bccCode)} and society_code = ${Number(req.params.societyCode)} and pno = ${Number(req.params.pno)}`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/producers', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query('SELECT TOP 300 * FROM PRODUCERS');
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/headquarters/:hqCode/bcc/:bccCode/societies/:societyCode/producers/:pno/cattle-information', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query(`SELECT * FROM CATTLE_INFORMATION WHERE bcc_code = ${Number(req.params.bccCode)} and society_code = ${Number(req.params.societyCode)} and producer_no = ${Number(req.params.pno)}`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/headquarters/:hqCode/bcc/:bccCode/societies/:societyCode/producers/:pno/milk-receipts-fn-consolidated', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query(`SELECT * FROM MILK_RECEIPTS_FN_CONSOLIDATED WHERE bcc_code = ${Number(req.params.bccCode)} and society_code = ${Number(req.params.societyCode)} and producer_no = ${Number(req.params.pno)} ORDER BY from_date DESC ;`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
app.get('/headquarters/:hqCode/bcc/:bccCode/societies/:societyCode/producers/:pno/milk-receipts-fn-consolidated/:fromDate/:toDate', async (req, res) => {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request().query(`SELECT * FROM MILK_RECEIPTS_FN_CONSOLIDATED WHERE from_date >= ${"'" + req.params.fromDate + " 00:00:00.000'"} and to_date <= ${"'" + req.params.toDate + " 00:00:00.000'"} and bcc_code = ${Number(req.params.bccCode)} and society_code = ${Number(req.params.societyCode)} and producer_no = ${Number(req.params.pno)} ORDER BY from_date ASC ;`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});


app.get('/headquarters/:hqCode/bcc/:bccCode/societies/:societyCode/producers/:pno/recoveries-entry-fn', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query(`SELECT * FROM RECOVERIES_ENTRY_FN WHERE bcc_code = ${Number(req.params.bccCode)} and society_code = ${Number(req.params.societyCode)} and producer_no = ${Number(req.params.pno)} ORDER BY recovery_name ASC`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/headquarters/:hqCode/bcc/:bccCode/societies/:societyCode/producers/:pno/recoveries-entry-fn/:fromDate/:toDate', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query(`SELECT * FROM RECOVERIES_ENTRY_FN WHERE bcc_code = ${Number(req.params.bccCode)} and society_code = ${Number(req.params.societyCode)} and producer_no = ${Number(req.params.pno)} and from_date >= ${"'" + req.params.fromDate + " 00:00:00.000'"} and to_date <= ${"'" + req.params.toDate + " 00:00:00.000'"} ORDER BY recovery_name ASC`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/bcc/:bccCode/societies/:fromDate/:toDate', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query(`SELECT DISTINCT society_code, society_name FROM MILK_RECEIPTS_FN_CONSOLIDATED WHERE bcc_code = ${req.params.bccCode} and from_date >= ${"'" + req.params.fromDate + " 00:00:00.000'"} and to_date <= ${"'" + req.params.toDate + " 00:00:00.000'"} ORDER BY society_code`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});


app.get('/milk-receipts/bcc/:bccCode/societies/:societyCode/producers/:pno/:fromDate/:toDate', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query(`SELECT * FROM MILK_RECEIPTS where session_date BETWEEN ${"'" + req.params.fromDate + " 00:00:00.000'"} AND ${"'" + req.params.toDate + " 00:00:00.000'"} and bcc_code = ${Number(req.params.bccCode)} and society_code = ${Number(req.params.societyCode)} and producer_no = ${Number(req.params.pno)} and record_status = 'Active' ORDER BY session_date`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/milk-receipts/bcc/:bccCode/societies/:societyCode/producers/:pno/:fromDate/:toDate/:milkType/:milkSession', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query(`SELECT * FROM MILK_RECEIPTS where session_date BETWEEN ${"'" + req.params.fromDate + " 00:00:00.000'"} AND ${"'" + req.params.toDate + " 00:00:00.000'"} and bcc_code = ${Number(req.params.bccCode)} and society_code = ${Number(req.params.societyCode)} and producer_no = ${Number(req.params.pno)} and milk_type = '${req.params.milkType}' and milk_session = '${req.params.milkSession}' and record_status = 'Active' ORDER BY session_date`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/milk-receipts-fn-consolidated', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query('SELECT from_date, MAX(to_date) as to_date FROM MILK_RECEIPTS_FN_CONSOLIDATED GROUP BY from_date ORDER BY from_date DESC;');
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/milk-receipts-fn-consolidated/:fromDate/:toDate', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query(`SELECT  * FROM MILK_RECEIPTS_FN_CONSOLIDATED WHERE from_date = ${"'" + req.params.fromDate + " 00:00:00.000'"} and to_date = ${"'" + req.params.toDate + " 00:00:00.000'"}`);
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/recoveries-entry-fn', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query('SELECT TOP 300 * FROM RECOVERIES_ENTRY_FN');
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

const port = process.env.PORT || 9000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
