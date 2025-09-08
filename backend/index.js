const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

// Connect to MongoDB database
const mongoUrl = 'mongodb+srv://ammarraza1199_db_user:S1rjP0osEhUDMV5P@cluster0.09cgmln.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'medical-dashboard';

let db;

const connectToMongo = async () => {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
    
    // You can create collections here if they don't exist, but MongoDB creates them on first insertion.
    // Seeding initial data
    const users = db.collection('users');
    const departments = db.collection('departments');

    const existingDoctor = await users.findOne({ username: 'doctor1' });
    if (!existingDoctor) {
      await users.insertOne({ username: 'doctor1', password: 'password', role: 'doctor' });
    }

    const existingReceptionist = await users.findOne({ username: 'receptionist1' });
    if (!existingReceptionist) {
      await users.insertOne({ username: 'receptionist1', password: 'password', role: 'receptionist' });
    }

    const existingAdmin = await users.findOne({ username: 'admin' });
    if (!existingAdmin) {
      await users.insertOne({ username: 'admin', password: 'password', role: 'admin' });
    }

    const existingOncology = await departments.findOne({ name: 'Oncology' });
    if (!existingOncology) {
      await departments.insertMany([
        { name: 'Oncology' },
        { name: 'Gastronomy' },
        { name: 'Gynecology' },
        { name: 'Orthopedic' },
        { name: 'Dermatology' },
      ]);
    }

    const doctorsCollection = db.collection('doctors');
    const existingDoctors = await doctorsCollection.countDocuments();
    if (existingDoctors === 0) {
      await doctorsCollection.insertMany([
        { name: 'Dr. Sharma', specialty: 'Oncology' },
        { name: 'Dr. Patel', specialty: 'Gastronomy' },
        { name: 'Dr. Kumar', specialty: 'Gynecology' },
        { name: 'Dr. Gupta', specialty: 'Orthopedic' },
        { name: 'Dr. Singh', specialty: 'Dermatology' },
      ]);
    }

    const patientsCollection = db.collection('patients');
    const existingPatients = await patientsCollection.countDocuments();
    if (existingPatients === 0) {
      await patientsCollection.insertMany([
        {
          name: 'Rahul Sharma',
          height: 175,
          weight: 72,
          last_visited: '2023-05-15',
          last_diagnosis: 'Hypertension - Prescribed medication and lifestyle changes',
          status: 'online'
        },
        {
          name: 'Priya Patel',
          height: 162,
          weight: 58,
          last_visited: '2023-05-10',
          last_diagnosis: 'Type 2 Diabetes - Adjusted insulin dosage',
          status: 'offline'
        },
        {
          name: 'Amit Kumar',
          height: 168,
          weight: 65,
          last_visited: '2023-05-12',
          last_diagnosis: 'Asthma - Prescribed new inhaler',
          status: 'no-show'
        },
        {
          name: 'Neha Gupta',
          height: 170,
          weight: 60,
          last_visited: '2023-05-14',
          last_diagnosis: 'Migraine - Recommended specialist consultation',
          status: 'online'
        },
        {
          name: 'Sanjay Singh',
          height: 180,
          weight: 85,
          last_visited: '2023-05-08',
          last_diagnosis: 'Obesity - Dietary plan and exercise regimen',
          status: 'offline'
        }
      ]);
    }
    
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};

connectToMongo();

// User Authentication
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.collection('users').findOne({ username, password });
    if (user) {
      res.json({
        message: 'success',
        user: { id: user._id, username: user.username, role: user.role },
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(400).json({ error: err.message });
  }
});

// User Management API Endpoints
app.get('/users', async (req, res) => {
  try {
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
    res.json({ message: 'success', data: users });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/users', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const result = await db.collection('users').insertOne({ username, password, role });
    res.json({ message: 'success', data: { _id: result.insertedId, username, role } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/users/:id', async (req, res) => {
  const { username, role } = req.body;
  const { id } = req.params;
  try {
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { username, role } },
      { returnDocument: 'after', projection: { password: 0 } }
    );
    res.json({ message: 'success', data: result.value });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'success' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Inventory API Endpoints
app.get('/inventory', async (req, res) => {
  try {
    const inventory = await db.collection('inventory').find().toArray();
    res.json({ message: 'success', data: inventory });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/inventory', async (req, res) => {
  const { name, quantity, location } = req.body;
  try {
    const result = await db.collection('inventory').insertOne({ name, quantity, location });
    res.json({ message: 'success', data: { _id: result.insertedId, name, quantity, location } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/inventory/:id', async (req, res) => {
  const { name, quantity, location } = req.body;
  const { id } = req.params;
  try {
    const result = await db.collection('inventory').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { name, quantity, location } },
      { returnDocument: 'after' }
    );
    res.json({ message: 'success', data: result.value });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/inventory/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection('inventory').deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'success' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Doctor API Endpoints
app.get('/doctors', async (req, res) => {
  try {
    const doctors = await db.collection('doctors').find().toArray();
    res.json({ message: 'success', data: doctors });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/doctors', async (req, res) => {
  const { name, specialty } = req.body;
  try {
    const result = await db.collection('doctors').insertOne({ name, specialty });
    res.json({ message: 'success', data: { _id: result.insertedId, name, specialty } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Patient API Endpoints
app.get('/patients', async (req, res) => {
  try {
    const patients = await db.collection('patients').find().toArray();
    res.json({ message: 'success', data: patients });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/patients/name/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const patient = await db.collection('patients').findOne({ name });
    if (patient) {
      res.json({ message: 'success', data: patient });
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/patients/:id', async (req, res) => {
  const { name, height, weight, last_visited, last_diagnosis, purposeOfVisit, notes, isEmergency, extraDocuments, status, receptionNotes, documentsCarried, previousVisitsCount, previousVisitDate } = req.body;
  const { id } = req.params;
  try {
    const result = await db.collection('patients').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { name, height, weight, last_visited, last_diagnosis, purposeOfVisit, notes, isEmergency, extraDocuments, status, receptionNotes, documentsCarried, previousVisitsCount, previousVisitDate } },
      { returnDocument: 'after' }
    );
    res.json({ message: 'success', data: result.value });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/patients', async (req, res) => {
  const { name, height, weight, last_visited, last_diagnosis, purposeOfVisit, notes, isEmergency, extraDocuments, status, receptionNotes, documentsCarried, previousVisitsCount, previousVisitDate } = req.body;
  try {
    const result = await db.collection('patients').insertOne({ name, height, weight, last_visited, last_diagnosis, purposeOfVisit, notes, isEmergency, extraDocuments, status, receptionNotes, documentsCarried, previousVisitsCount, previousVisitDate, createdAt: new Date() });
    res.json({ message: 'success', data: { _id: result.insertedId, name, height, weight, last_visited, last_diagnosis, purposeOfVisit, notes, isEmergency, extraDocuments, status, receptionNotes, documentsCarried, previousVisitsCount, previousVisitDate } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/meetings', async (req, res) => {
  try {
    const meetings = await db.collection('meetings').aggregate([
      {
        $lookup: {
          from: 'patients',
          localField: 'patient_id',
          foreignField: '_id',
          as: 'patient'
        }
      },
      {
        $unwind: '$patient'
      },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctor_id',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      {
        $unwind: '$doctor'
      },
      {
        $project: {
          _id: 1,
          date: 1,
          time: 1,
          patient_name: '$patient.name',
          doctor_name: '$doctor.name'
        }
      }
    ]).toArray();
    res.json({ message: 'success', data: meetings });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/meetings', async (req, res) => {
  const { patient_id, doctor_id, date, time } = req.body;
  try {
    const result = await db.collection('meetings').insertOne({ patient_id: new ObjectId(patient_id), doctor_id: new ObjectId(doctor_id), date, time });
    res.json({ message: 'success', data: { _id: result.insertedId, patient_id, doctor_id, date, time } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/meetings/doctor/:doctorId', async (req, res) => {
  const { doctorId } = req.params;
  try {
    const meetings = await db.collection('meetings').aggregate([
      {
        $match: { doctor_id: new ObjectId(doctorId) }
      },
      {
        $lookup: {
          from: 'patients',
          localField: 'patient_id',
          foreignField: '_id',
          as: 'patient'
        }
      },
      {
        $unwind: '$patient'
      },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctor_id',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      {
        $unwind: '$doctor'
      },
      {
        $project: {
          _id: 1,
          date: 1,
          time: 1,
          patient_name: '$patient.name',
          doctor_name: '$doctor.name'
        }
      },
      {
        $sort: { date: -1, time: -1 }
      }
    ]).toArray();
    res.json({ message: 'success', data: meetings });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Conversation API Endpoints
app.post('/api/conversations', async (req, res) => {
  const { patient_name, conversation_data } = req.body;
  try {
    const result = await db.collection('conversations').insertOne({ patient_name, conversation_data, timestamp: new Date() });
    res.json({ message: 'success', data: { _id: result.insertedId, patient_name, conversation_data } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/conversations/:patientName', async (req, res) => {
  const { patientName } = req.params;
  try {
    const conversations = await db.collection('conversations').find({ patient_name: patientName }).sort({ timestamp: -1 }).toArray();
    res.json({ message: 'success', data: conversations });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Department API Endpoints
app.get('/departments', async (req, res) => {
  try {
    const departments = await db.collection('departments').find().toArray();
    res.json({ message: 'success', data: departments });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/departments', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await db.collection('departments').insertOne({ name });
    res.json({ message: 'success', data: { _id: result.insertedId, name } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Notification API Endpoint
app.post('/notifications', async (req, res) => {
  const { recipient_type, recipient_id, message } = req.body;
  try {
    const result = await db.collection('notifications').insertOne({ recipient_type, recipient_id, message, timestamp: new Date() });
    res.json({ message: 'success', data: { _id: result.insertedId, recipient_type, recipient_id, message } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Software Usage API Endpoints
app.post('/software-usage', async (req, res) => {
  const { department_id, user_id, start_time, end_time, duration_minutes } = req.body;
  try {
    const result = await db.collection('software_usage').insertOne({ department_id: new ObjectId(department_id), user_id: new ObjectId(user_id), start_time, end_time, duration_minutes });
    res.json({ message: 'success', data: { _id: result.insertedId, department_id, user_id, start_time, end_time, duration_minutes } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/software-usage', async (req, res) => {
  try {
    const usage = await db.collection('software_usage').aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          start_time: 1,
          end_time: 1,
          duration_minutes: 1,
          department_name: '$department.name',
          user_username: '$user.username'
        }
      }
    ]).toArray();
    res.json({ message: 'success', data: usage });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Patient Visits by Department API Endpoint
app.get('/patient-visits-by-department', async (req, res) => {
  try {
    const visits = await db.collection('patients').aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $group: {
          _id: '$department.name',
          total_patients: { $sum: 1 }
        }
      },
      {
        $project: {
          department_name: '$_id',
          total_patients: 1,
          _id: 0
        }
      }
    ]).toArray();
    res.json({ message: 'success', data: visits });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Notes API Endpoints
app.get('/notes', async (req, res) => {
  try {
    const notes = await db.collection('notes').find().toArray();
    res.json({ message: 'success', data: notes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/notes', async (req, res) => {
  const { content } = req.body;
  try {
    const result = await db.collection('notes').insertOne({ content, timestamp: new Date() });
    res.json({ message: 'success', data: { _id: result.insertedId, content } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Queue API Endpoints
app.get('/queue', async (req, res) => {
  try {
    const queue = await db.collection('queue').find().toArray();
    res.json({ message: 'success', data: queue });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/queue', async (req, res) => {
  const { patient_name, doctor_name } = req.body;
  try {
    const result = await db.collection('queue').insertOne({ patient_name, doctor_name, timestamp: new Date() });
    res.json({ message: 'success', data: { _id: result.insertedId, patient_name, doctor_name } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});