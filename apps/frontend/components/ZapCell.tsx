
export const ZapCell = ({
    name,
    index,
    onClick
}: {
    name?: string; 
    index: number;
    onClick: () => void;
}) => {
    return <div onClick={onClick} className="bg-gray-800 text-gray-200 rounded-xl shadow-lg hover:bg-gray-700 cursor-pointer px-6 py-4">
        <div className="flex text-xl">
            <div className="font-semibold">
                {index}. 
            </div>
            <div>
                {name}
            </div>
        </div>
    </div>
}