const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// تحديث مسار ملف البيانات ليكون ديناميكيًا بناءً على بيئة التشغيل
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "data.json");

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// معالجة الطلبات إلى المسار الجذر
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// تهيئة ملف البيانات إذا لم يكن موجوداً
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(
      [
        {
          id: 1,
          name: "أحمد محمد علي",
          title: "مدير قسم تقنية المعلومات",
          courses: [
            "إدارة مشاريع تكنولوجيا المعلومات",
            "أمن الشبكات والمعلومات",
          ],
        },
        {
          id: 2,
          name: "سارة خالد عبدالله",
          title: "مطورة ويب رئيسية",
          courses: [
            "تطوير تطبيقات الويب باستخدام React",
            "Node.js وإنشاء APIs",
          ],
        },
      ],
      null,
      2
    )
  );
} else {
  console.log(`Data file found at path: ${DATA_FILE}`);
}

// قراءة البيانات من الملف
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

// كتابة البيانات إلى الملف
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// الحصول على جميع الموظفين
app.get("/api/employees", (req, res) => {
  try {
    console.log("Fetching employees from data file...");
    const employees = readData();
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "حدث خطأ أثناء قراءة البيانات" });
  }
});

// إضافة موظف جديد
app.post("/api/employees", (req, res) => {
  try {
    const employees = readData();
    const newEmployee = {
      id:
        employees.length > 0 ? Math.max(...employees.map((e) => e.id)) + 1 : 1,
      ...req.body,
    };
    employees.push(newEmployee);
    writeData(employees);
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء إضافة الموظف" });
  }
});

// تحديث موظف موجود
app.put("/api/employees/:id", (req, res) => {
  try {
    console.log("Update request received:", {
      id: req.params.id,
      body: req.body,
    });

    const employees = readData();
    const index = employees.findIndex((e) => e.id === parseInt(req.params.id));

    if (index === -1) {
      console.error(`Employee with ID ${req.params.id} not found.`);
      return res.status(404).json({ error: "الموظف غير موجود" });
    }

    employees[index] = { ...employees[index], ...req.body };
    writeData(employees);
    res.json(employees[index]);
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: "حدث خطأ أثناء تحديث الموظف" });
  }
});

// الحصول على موظف واحد حسب id
app.get("/api/employees/:id", (req, res) => {
  try {
    const employees = readData();
    const employee = employees.find((e) => e.id === parseInt(req.params.id));
    if (!employee) {
      return res.status(404).json({ error: "الموظف غير موجود" });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء قراءة بيانات الموظف" });
  }
});

// حذف موظف
app.delete("/api/employees/:id", (req, res) => {
  try {
    console.log("Delete request received:", {
      id: req.params.id,
    });

    const employees = readData();
    const filteredEmployees = employees.filter(
      (e) => e.id !== parseInt(req.params.id)
    );

    if (employees.length === filteredEmployees.length) {
      console.error(
        `Employee with ID ${req.params.id} not found for deletion.`
      );
      return res.status(404).json({ error: "الموظف غير موجود" });
    }

    writeData(filteredEmployees);
    res.json({ message: "تم حذف الموظف بنجاح" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error: "حدث خطأ أثناء حذف الموظف" });
  }
});

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
