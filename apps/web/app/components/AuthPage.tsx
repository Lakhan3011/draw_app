"use client";
export default function AuthPage({ isSignin }: {
    isSignin: boolean
}) {
    return (
        <div className="w-screen h-screen  flex justify-center items-center">
            <div className="flex flex-col gap-4 bg-white p-4 rounded-sm">
                <div className="text-center font-semibold text-2xl text-gray-700">ExcaliDraw</div>
                <div className="flex flex-col gap-4 p-2 ">
                    <input className="outline-none border-2 rounded-sm border-gray-600 p-2" type="text" placeholder="Email " />
                    <input className="outline-none border-2 rounded-sm border-gray-600 p-2" type="password" placeholder="Password" />
                </div>
                <div className="text-center font-semibold bg-neutral-500 hover:bg-neutral-600 rounded p-2 cursor-pointer">
                    <button
                        onClick={() => {

                        }}
                    >
                        {isSignin ? "Signin" : "Signup"}
                    </button>
                </div>

            </div>
        </div>
    )
}