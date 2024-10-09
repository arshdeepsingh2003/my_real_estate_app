import {Link} from 'react-router-dom';


const SignUp=()=> {
    return (
      
      <div className="p-3 max-w-lg mx-auto">
        <h1 className="text-3l text-center font-bold my-7">Sign Up</h1>
        <form className="flex flex-col gap-4 ">
          < input type="text" placeholder="username" className="border p-3 rounded-lg " id='username'/>
          < input type="text" placeholder="email" className="border p-3 rounded-lg " id='email'/>
          < input type="text" placeholder="password" className="border p-3 rounded-lg " id='password'/>
          <button className='bg-slate-700 text-white p-3 rounded-lg uppercase h0ver:opacity-95 disabled:opacity-80'>Sign_up</button>

        </form>
        <div className='flex gap-2 mt-5'>
          <p>Have an Account?</p>
          <Link to={"/sign-in"}>
          <span className='text-blue-800'>Sign in</span>
          
          </Link>
          
          </div>
      </div>
    )
  }
  export default SignUp;