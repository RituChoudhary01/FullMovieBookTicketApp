// import mongoose from "mongoose";

// const showSchema = new mongoose.Schema(
//   {
//   movie:{ type: String, required:true, ref:'Movie'},
//   showDateTime : {type:Date, required:true},
//   showPrice: { type:Number, required:true},
//   occupiedSeats:{ type:Object, default:{}}
//   }, {minimize: false}
// )

// const Show = mongoose.model("Show",showSchema);
// export default Show;

import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: { 
      type: String,        // or mongoose.Schema.Types.ObjectId if Movie uses ObjectId
      required: true, 
      ref: 'Movie'         // references the Movie model
    },
    showDateTime: {
      type: Date,
      required: true
    },
    showPrice: {
      type: Number,
      required: true
    },
    occupiedSeats: {
      type: Object,
      default: {},
    }
  },
  { minimize: false, timestamps: true } // ✅ Added timestamps for createdAt/updatedAt
);

const Show = mongoose.model("Show", showSchema);
export default Show;
