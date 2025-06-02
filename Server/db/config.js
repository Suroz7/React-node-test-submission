const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../model/schema/user');
const bcrypt = require('bcrypt');
const { initializeLeadSchema } = require("../model/schema/lead");
const { initializeContactSchema } = require("../model/schema/contact");
const { initializePropertySchema } = require("../model/schema/property");
const { createNewModule } = require("../controllers/customField/customField.js");
const { contactFields } = require('./contactFields.js');
const { leadFields } = require('./leadFields.js');
const { propertiesFields } = require('./propertiesFields.js');
const {customField} = require('../model/schema/customField.js'); // Require here - MOVE TO TOP

const initializedSchemas = async () => {
    await initializeLeadSchema();
    await initializeContactSchema();
    await initializePropertySchema();
}
const createDynamicSchemas = async () => {
    try {
        // Define customField model if it doesn't exist
        if (!mongoose.models.CustomField) {
            const customFieldSchema = new mongoose.Schema({
                moduleName: String,
                fields: Array,
                deleted: {
                    type: Boolean,
                    default: false
                }
            });
            mongoose.model('CustomField', customFieldSchema);
        }

        // Now use the model
        const CustomFields = await mongoose.model('CustomField').find({ deleted: false });
        
        for (const module of CustomFields) {
            const { moduleName, fields } = module;
            
            if (!mongoose.models[moduleName]) {
                const schemaFields = {};
                for (const field of fields) {
                    schemaFields[field.name] = { type: field.backendType };
                }
                const moduleSchema = new mongoose.Schema(schemaFields);
                mongoose.model(moduleName, moduleSchema, moduleName);
                console.log(`Schema created for module: ${moduleName}`);
            }
        }
    } catch (error) {
        console.error("Error creating dynamic schemas:", error);
        throw error;
    }
};

const createDefaultModules = async () => {
    const mockRes = {
        status: (code) => ({
            json: (data) => { }
        }),
        json: (data) => { }
    };

    // Create default modules
    await createNewModule({ body: { moduleName: 'Leads', fields: leadFields, headings: [], isDefault: true } }, mockRes);
    await createNewModule({ body: { moduleName: 'Contacts', fields: contactFields, headings: [], isDefault: true } }, mockRes);
    await createNewModule({ body: { moduleName: 'Properties', fields: propertiesFields, headings: [], isDefault: true } }, mockRes);
}

const createAdminUser = async () => {
    // Check and create admin user if not exists
    let adminExisting = await User.find({ role: 'superAdmin' });
    console.log("Existing admin users:", adminExisting); // Add this line

    if (adminExisting.length <= 0) {
        const phoneNumber = 7874263694;
        const firstName = 'Prolink';
        const lastName = 'Infotech';
        const username = 'admin@gmail.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const user = new User({
                // _id: new mongoose.Types.ObjectId('64d33173fd7ff3fa0924a109'), // Remove this line
                username,
                password: hashedPassword,
                firstName,
                lastName,
                phoneNumber,
                role: 'superAdmin'
            });
            await user.save();
            console.log("Admin created successfully..");
        } catch (error) {
            console.error("Error creating admin user:", error); // Add this line
        }
    }
}

const connectDB = async () => {
    try {
        const DATABASE_URL = process.env.DATABASE_URL;
        const DATABASE = process.env.DATABASE;

        if (!DATABASE_URL || !DATABASE) {
            throw new Error('Database configuration missing in environment variables');
        }

        const DB_OPTIONS = {
            dbName: DATABASE,
            useNewUrlParser: true,
            useUnifiedTopology: true
        }

        mongoose.set("strictQuery", false);
        
        await mongoose.connect(DATABASE_URL, DB_OPTIONS);
        console.log("Database Connected Successfully..");
        
        // Initialize schemas in order
        await initializedSchemas();
        await createDynamicSchemas();
        await createDefaultModules();
        await createAdminUser();
        
        console.log("All initializations completed successfully.");
        
    } catch (err) {
        console.log("Database Not connected:", err.message);
        throw err;
    }
}

module.exports = connectDB;