import { ReactNode } from "react"

export function IconButton({ icon, onClick, activated }: {
    icon: ReactNode,
    onClick: () => void,
    activated: boolean
}) {
    return (
        <div
            onClick={onClick}
            className={`cursor-pointer rounded-full bg-black  p-2  ${activated ? " text-red-600" : "text-white "} hover:bg-gray-600`}
        >
            {icon}
        </div>
    )
}