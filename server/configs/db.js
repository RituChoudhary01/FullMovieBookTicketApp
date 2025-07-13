import mongoose from 'mongoose';
const connectDB = async() => {
  try{
    mongoose.connection.on('connected', ()=> console.log('Database connected'));
    await mongoose.connect(`${process.env.MONGODB_URI}/quickshow`)
  } catch(error){
    console.log("Error aa gya bhai db connection me."+error.message);
    process.exit(1);
  }
}
export default connectDB;


