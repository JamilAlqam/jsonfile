const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3000;

// إعداد Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// معالجة الطلبات إلى المسار الجذر
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// استبدال مسارات API للتعامل مع Supabase

// جلب جميع الموظفين
app.get('/api/employees', async (req, res) => {
  try {
    const { data, error } = await supabase.from('employees').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// إضافة موظف جديد
app.post('/api/employees', async (req, res) => {
  try {
    const { name, job_title, training_courses } = req.body;
    const { data, error } = await supabase.from('employees').insert([{ name, job_title, training_courses }]);
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error adding employee:', err);
    res.status(500).json({ error: 'Failed to add employee' });
  }
});

// تعديل بيانات موظف
app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, job_title, training_courses } = req.body;
    const { data, error } = await supabase.from('employees').update({ name, job_title, training_courses }).eq('id', id);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// حذف موظف
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
