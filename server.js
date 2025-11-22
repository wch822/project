const express = require('express');
const app = express();
const fsPromises = require('node:fs/promises');
const formidable = require('express-formidable'); 
const { MongoClient, ObjectId } = require('mongodb');
const url = 'mongodb+srv://11:11@cluster0.xt5bpw2.mongodb.net/?appName=Cluster0';
const client = new MongoClient(url);
const dbName = 'Project';
const collectionName = 'restaurant';

app.use(formidable());

app.set('view engine', 'ejs');

var islogin = 0;

const handle_login = async (req, res) => {
    let user = {};
    user['name'] = req.fields.username;
    user['password'] = req.fields.password;
    if (user['name'] == "user" && user['password'] == "user")
    {
    	res.redirect('/list');
    	islogin = 1;
    }
    else
    {
    	res.redirect('/login');
    }
}

const insertDocument = async (db, doc) => {
    var collection = db.collection(collectionName);
    let results = await collection.insertOne(doc);
    console.log("insert one document:" + JSON.stringify(results));
    return results;
}

const handle_create = async (req, res) => {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    let newDoc = {
    restaurant_id: req.fields.restaurantid,
    name: req.fields.restaurantname
    };

    await insertDocument(db, newDoc);
    res.redirect('/list');
}

const findDocument = async (db, criteria) => {
    let findResults = [];
    let collection = db.collection(collectionName);
    console.log('findCriteria: ${JSON.stringify(criteria)}');
    findResults = await collection.find(criteria).toArray();
    console.log('findDocument: ${findResults.length}');
    console.log('findResults: ${JSON.stringify(findResults)}');
    return findResults;
}

const handle_find = async (res, criteria) => {
    await client.connect();
    console.log("Cpnnected successfully to server");
    const db = client.db(dbName);
    const docs = await findDocument(db,criteria);
    await client.close();
    console.log("Closed DB connection");
    res.status(200).render('list',{nRestaurants:docs.length ,restaurants:docs});
}

const handle_details = async (res, criteria) => {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    let DOCID = {};
    DOCID['_id'] = new ObjectId(criteria._id);
    const docs = await findDocument(db, DOCID);
    await client.close();
    console.log("Closed DB connection");
    res.status(200).render('details', {restaurant: docs[0]});
    }
    
const handle_edit = async (res, criteria) => {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db(dbName);

    let DOCID = {};
    DOCID['_id'] = new ObjectId(criteria._id);
    const docs = await findDocument(db, DOCID);
    await client.close();
    console.log("Closed DB connection");
    res.status(200).render('edit',{restaurant: docs[0]});
}

const updateDocument = async (db, criteria, updateDoc) => {
    let updateResults = [];
    let collection = db.collection(collectionName);
    console.log(`updateCriteria: ${JSON.stringify(criteria)}`);
    updateResults = await collection.updateOne(criteria,{$set : updateDoc});
    console.log(`updateResults: ${JSON.stringify(updateResults)}`);
    return updateResults;
}

const handle_update = async (req, res, criteria) => {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    var DOCID = {};
    DOCID['_id'] = new ObjectId(req.fields._id);
    var updateDoc = {};
    updateDoc['restaurant_id'] = req.fields.restaurantid;
    updateDoc['name'] = req.fields.restaurantname;
    const results = await updateDocument(db, DOCID, updateDoc);
    await client.close();
    console.log("Closed DB connection");
    res.status(200).render('info', {message: `Updated ${results.modifiedCount} document(s)`});
}

const handle_delete = async (res, criteria) => {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    let collection = db.collection(collectionName);
    let DOCID = {};
    DOCID['_id'] = new ObjectId(criteria._id)
    deleteResults = await collection.deleteOne(DOCID);
    console.log(DOCID);
    console.log(`deleteResults: ${JSON.stringify(deleteResults)}`);
    await client.close();
    console.log("Closed DB connection");
    res.redirect('/list');
    }
    
app.get('/login', (req, res) => {
    res.status(200).render('login');
})

app.post('/login', (req, res) => {
    handle_login(req,res);
})

app.get('/logout', (req, res) => {
    res.redirect('/login');
    islogin = 0;
})

app.get('/',(req,res) => {
     if (islogin == 0)
     {
     	res.redirect('/login');
     }
     else
     {
     	res.redirect('/list');
     }
     
})

app.get('/create', (req, res) => {
    if (islogin == 1)
     {
     	res.status(200).render('create');
     }
     else
     {
     	res.redirect('/login');
     }
})

app.post('/create', (req, res) => {
    handle_create(req, res);
})

app.get('/list',(req,res) => {
     if (islogin == 1)
     {
     	handle_find(res, req.query.docs);
     }
     else
     {
     	res.redirect('/login');
     }
})

app.get('/details', (req,res) => { 
     if (islogin == 1)
     {
     	handle_details(res, req.query); 
     }
     else
     {
     	res.redirect('/login');
     }
})

app.get('/edit', (req,res) => { 
     if (islogin == 1)
     {
     	handle_edit(res, req.query);
     }
     else
     {
     	res.redirect('/login');
     }
})

app.get('/delete', (req,res) => { 
     if (islogin == 1)
     {
     	handle_delete(res, req.query);
     }
     else
     {
     	res.redirect('/login');
     }
})

app.post('/update', (req,res) => {  
    handle_update(req, res, req.query); 
})

app.post('/api/restaurant/:restaurantid', async (req, res) => { 
    if (req.params.restaurantid) {
        console.log(req.body)
        await client.connect();
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        let newDoc = {
            restaurant_id: req.fields.restaurantid,
            name: req.fields.restaurantname
            };
        await insertDocument(db, newDoc);
        res.status(200).json({ "Successfully inserted": newDoc }).end();
        }
    else {
            res.status(500).json({ "error": "missing restaurantid" });
         }
    });
    
    app.get('/api/restaurant/:restaurantid', async (req, res) => { 
    if (req.params.restaurantid) {
        console.log(req.body)
        let criteria = {}
        criteria['restaurant_id'] = req.params.restaurantid;
        await client.connect();
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        const docs = await findDocument(db, criteria);
        res.status(200).json(docs);
    } else {
        res.status(500).json({"error": "missing restaurantid"}).end();
    }
});

app.put('/api/restaurant/:restaurantid', async (req, res) => {
    if (req.params.restaurantid) {
        console.log(req.body)
        let criteria = {}
        criteria['restaurant_id'] = req.params.restaurantid;
        await client.connect();
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        let updateData = {
            restaurant_id: req.fields.restaurantid || req.params.restaurantid,
            name: req.fields.restaurantname,
        };
        const results = await updateDocument(db, criteria, updateData);
        res.status(200).json(results).end();
    } 
    else {
        res.status(500).json({"error": "missing restaurantid"});
    }
});

app.delete('/api/restaurant/:restaurantid', async (req, res) => {
    if (req.params.restaurantid) {
        console.log(req.body)
        const db = client.db(dbName);
        let collection = db.collection(collectionName);
        let criteria = {}
        criteria['restaurant_id'] = req.params.restaurantid;
        await client.connect();
        console.log("Connected successfully to server");
        const results = await collection.deleteOne(criteria);
        console.log(results)
        res.status(200).json(results).end();
    } else {
        res.status(500).json({"error": "missing restaurantid"});
    }
});

const server = app.listen(process.env.PORT || 8099, () => {
    const port = server.address().port;
    console.log(`Server listening at port ${port}`);
  });


