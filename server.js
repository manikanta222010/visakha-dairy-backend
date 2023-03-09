const express = require('express');
const cors = require('cors');
const app = express();
const sql = require('mssql');
const dotenv = require('dotenv')
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

app.get('/', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query('SELECT TOP 50 * FROM PRODUCERS');
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/headquarters', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query('SELECT * FROM HEAD_QUARTERS');
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/headquarters/:hqCode/bcc', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query(`SELECT ASSOCIATED_HQS.hq_code, HEAD_QUARTERS.hq_name, BCC.* FROM BCC INNER JOIN ASSOCIATED_HQS ON BCC.bcc_code = ASSOCIATED_HQS.bcc_code INNER JOIN HEAD_QUARTERS ON ASSOCIATED_HQS.hq_code = HEAD_QUARTERS.hq_code WHERE ASSOCIATED_HQS.hq_code=7`);
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
    let result = await pool.request().query(`SELECT * FROM MILK_RECEIPTS_FN_CONSOLIDATED WHERE bcc_code = ${Number(req.params.bccCode)} and society_code = ${Number(req.params.societyCode)} and producer_no = ${Number(req.params.pno)} ORDER BY from_date ASC ;`);
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

app.get('/cattle-information', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query('SELECT TOP 300 * FROM CATTLE_INFORMATION');
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/milk-receipts', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query('SELECT TOP 300 * FROM MILK_RECEIPTS');
    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/milk-receipts-fn-consolidated', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query('SELECT TOP 300 * FROM MILK_RECEIPTS_FN_CONSOLIDATED');
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
