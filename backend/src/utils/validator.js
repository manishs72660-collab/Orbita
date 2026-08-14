const User=require("../models/user.models")
const validator=require("validator")
const validuser=async (data) => {
        const mandatoryfield=["username","usermail","mobile_num","password","address"];
        const IsAllowed = mandatoryfield.every((k)=> Object.keys(data).includes(k));
        if(!IsAllowed)
          throw new Error("Fields Missing");
        const { address } = data;
        if (!address?.home || address.home.length < 5 || address.home.length > 20) {
              throw new Error("Home is required and must be between 5 and 20 characters");
        }
        const pin=address.pincode;
        if (!validator.isPostalCode(pin, "IN")) {
               throw new Error("Invalid Indian pincode");
        }
        const city=address.city;
        if (!validator.isAlpha(city.replace(/\s/g, ""), "en-IN")) {
               throw new Error("Invalid city name");
        }
        const {usermail}=data;
        const isvalid=validator.isEmail(usermail);
        if(!isvalid){
            throw new Error("invalid email");
        }
        const {mobile_num}=data;
        if(!validator.isMobilePhone(mobile_num, "en-IN")){
            throw new Error("mobile nuber is not valid");
        }
        const isexit=await User.exists({usermail});
        if(isexit){
            throw new Error("user already exit");
        }
}

module.exports=validuser;