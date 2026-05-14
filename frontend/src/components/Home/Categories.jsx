import { useNavigate } from 'react-router-dom';

function Categories() {
    const navigate = useNavigate();

    const categories = [
        { name: 'MEN', image: '/static/categories/men.jpg', link: '/shop/men' },
        { name: 'WOMEN', image: '/static/categories/women/w1.jpg', link: '/shop/women' },
        { name: 'KIDS', image: '/static/categories/kids.jpg', link: '/shop/kids' },
        { name: 'NEW', image: '/static/categories/new.jpg', link: '/new-arrivals' },
    ];

    const handleClick = (cat) => {
        navigate(cat.link);
    };

    return (
        <div data-nav-color="light" className="py-16 px-6 bg-white">
            <h2
                className="text-4xl md:text-5xl font-semibold mb-12 text-center tracking-widest uppercase"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Shop By Category
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {categories.map((cat) => (
                    <div
                        key={cat.name}
                        onClick={() => handleClick(cat)}
                        className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg">
                        <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-80 object-cover transform group-hover:scale-110 transition duration-500"
                        />
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
