import { useNavigate } from 'react-router-dom';

function Categories() {
    const navigate = useNavigate();

    const categories = [
        { name: 'MEN', image: '/categories/men.jpg' },
        { name: 'WOMEN', image: '/categories/women/women.jpg' },
        { name: 'KIDS', image: '/categories/kids.jpg' },
        { name: 'NEW', image: '/categories/new.jpg' },
    ];

    // ====================================
    // CATEGORY CLICK (PUBLIC)
    // ====================================
    const handleClick = (category) => {
        // NO LOGIN REQUIRED
        navigate(`/shop/${category.toLowerCase()}`); // Navigate to category page (e.g., /shop/men)
    };

    return (
        <div data-nav-color="light" className="py-16 px-6 bg-white">
            {/* HEADING */}
            <h2
                className="text-4xl md:text-5xl font-semibold mb-12 text-center tracking-widest uppercase"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Shop By Category
            </h2>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {categories.map((cat) => (
                    <div
                        key={cat.name}
                        onClick={() => handleClick(cat.name)}
                        className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg">
                        {/* IMAGE */}
                        <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-80 object-cover transform group-hover:scale-110 transition duration-500"
                        />

                        {/* OVERLAY */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition duration-300 flex items-center justify-center">
                            <h2
                                className="text-white text-2xl font-bold tracking-widest opacity-0 group-hover:opacity-100 transition duration-300"
                                style={{ fontFamily: "'Playfair Display', serif" }}>
                                {cat.name}
                            </h2>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Categories;
