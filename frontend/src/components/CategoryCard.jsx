

const CategoryCard = ({name,image,onClick}) => {
  return (
    <div onClick={onClick} className='w-30 h-30 md:w-45 md:h-45 rounded-2xl border-2 border-orange-200 shrink-0 overflow-hidden bg-white shadow-xl shadow-gray-200 hover:shadow-lg transition-shadow relative'>
    <img src={image} alt="" className='w-full h-full object-cover transform hover:scale-110 transition-transform duration-300 cursor-pointer' />
    <div className='absolute bottom-0 w-full left-0 bg-gray-100 bg-opacity-95 px-3 py-1 rounded-t-xl text-center shadow text-sm font-medium text-gray-800 backdrop-blur'>
         {name}
    </div>
    </div>
  )
}

export default CategoryCard