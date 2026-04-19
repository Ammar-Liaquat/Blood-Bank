const mongoose = require("mongoose")
const connectdb = async ()=>{

    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Mongodb Is Connected");
        
    } catch (error) {
        console.log("Mongodb Is Not Connectd", error);
        
    }
}
module.exports = connectdb