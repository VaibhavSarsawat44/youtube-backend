import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async(userId)=>{
  try{
    const user = await User.findById(userId)
     const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    
    user.refreshToken =refreshToken
    await user.save({ validateBeforeSave: false })
    
    return {accessToken,refreshToken}

  }catch(error){
    throw new ApiError(500,"Something went wrong while genrating refresh and acsses token ")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body || {};

  // FIXED validation
  if (![fullName, email, username, password].every(v => v && v.toString().trim())) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  console.log(req.files); 

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
let coverImageLocalPath;
if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
}

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  );
});

const deleteAllUsers = asyncHandler(async (req, res) => {
  await User.deleteMany({});
  return res.status(200).json(
    new ApiResponse(200, {}, "All users deleted successfully")
  );
});

const loginUser = asyncHandler(async(req,res)=>{
  // req body -> data
  // username or email
  // find the user 
  // /password check
  // access and referesh token 
  // /send cookie

  const {email,password,username}= req.body

  if (!(username || email)) {
    throw new ApiError(400,"username or email is required")
  }
  const user =await User.findOne({
    $or:[{username},{email}]
  })
  if(!user){
    throw new ApiError(404,"User does not exist")
  }
  const isPasswordValid = await user.isPasswordValid(password)
  if(!isPasswordValid){
    throw new ApiError (401,"Invalid user credentials")
  }

  const {accessToken,refreshToken} = await 
  generateAccessAndRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id).
  select("-password -refreshToken")

  const options = {
    httpOnly:true,
    secure:true
  }

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user:loggedInUser,accessToken,refreshToken
      },
      "User logged in SuccessFully"
    )
  )
})

const logoutUser = asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
    req.user._id,{
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
   )
    const options = {
    httpOnly:true,
    secure:true
  }
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"USer logged Out"))
})


export { registerUser, deleteAllUsers,loginUser,logoutUser};