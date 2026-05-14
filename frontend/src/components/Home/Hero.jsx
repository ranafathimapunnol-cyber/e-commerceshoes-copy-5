import { useNavigate } from 'react-router-dom';

function Hero() {
    const navigate = useNavigate();

    // PUBLIC PRODUCTS PAGE
    const handleShopNow = () => {
        navigate('/products');
    };

    return (
        <section className="relative h-screen w-full overflow-hidden">
            {/* VIDEO */}
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                <source src="/static/media/products/videos/shoes.mp4" type="video/mp4" />
            </video>

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-black/50"></div>

            {/* CONTENT */}
            <div className="relative z-10 flex flex-col justify-center h-full px-16 text-white">
                <p className="tracking-[8px] text-lg mb-4">NEW COLLECTION 2026</p>

                <h1 className="text-7xl md:text-9xl font-black">RAPIDO</h1>

                <p className="mt-6 text-xl text-gray-300">MOVE FAST. STAY AHEAD.</p>

                <button
                    onClick={handleShopNow}
                    className="mt-8 bg-white text-black px-8 py-4 rounded-md w-fit font-bold hover:bg-gray-200 transition">
                    SHOP NOW
                </button>
            </div>
        </section>
    );
}

export default Hero;
