import {createSlice} from '@reduxjs/toolkit'; 
// Importing the necessary functions from Redux Toolkit. 'createSlice' is used to create a slice of the Redux state.

const initialState = {
    currentUser: null,  // The initial state for the user, with no user signed in initially.
    error: null,        // To store any errors encountered during the sign-in process.
    loading: false,     // To track whether a sign-in request is currently in progress.
};

// Creating a user slice with the name 'user', defining the initial state and reducers.
const userSlice = createSlice({
    name: 'user',  
    initialState,  
    
    reducers: {    
        
        // Action triggered when the sign-in process starts, sets loading to true.
        signInStart: (state) => {
            state.loading = true;  // Setting loading to true to indicate sign-in is in progress.
        },
        
        // Action triggered when sign-in is successful, updates the currentUser and resets loading and error.
        signInSuccess: (state, action) => {
            state.currentUser = action.payload;  // The user details (payload) are stored in currentUser.
            state.loading = false;               // Loading is set to false since sign-in is complete.
            state.error = null;                  // Error is reset to null in case there was a previous error.
        },
        
        // Action triggered when sign-in fails, sets the error message and stops loading.
        signInFailure: (state, action) => {
            state.error = action.payload;  // The error message (payload) is stored in error.
            state.loading = false;         // Loading is set to false since the process has completed with an error.
        },

        updateUserStart:(state)=>{
            state.loading=true;
        },
        updateUserSuccess:(state,action)=>{
            state.currentUser=action.payload;
            state.loading=false;
            state.error=null;
        },
        updateUserFailure:(state,action)=>{
            state.error=action.payload;
            state.loading=false;
        },
        deleteUserStart: (state) => {
            state.loading = true;
          },
          deleteUserSuccess: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
          },
          deleteUserFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
          },
    }
});

// Exporting the actions for use in dispatching.
export const {
    signInStart,
    signInSuccess,
    signInFailure,
    updateUserFailure,
    updateUserSuccess,
    updateUserStart,
    deleteUserFailure,
    deleteUserSuccess,
    deleteUserStart,
    
  } = userSlice.actions;
  

// Exporting the reducer function for integration into the Redux store.
export default userSlice.reducer;
