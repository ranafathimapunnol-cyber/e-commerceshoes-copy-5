import { useNavigate } from 'react-router-dom';

function OfferBanner() {
    const navigate = useNavigate();

    // ====================================
    // EXPLORE PRODUCTS (PUBLIC)
    // ====================================
    const handleExplore = () => {
        // NO LOGIN REQUIRED
        navigate('/products');
    };

    return (
        <div className="relative h-[80vh] overflow-hidden">
            {/* VIDEO BACKGROUND */}
            <video autoPlay muted loop playsInline className="absolute w-full h-full object-cover">
                <source src="/videos/offer.mp4" type="video/mp4" />
            </video>

            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-black/60"></div>

            {/* CONTENT */}
            <div className="relative z-10 flex flex-col justify-center items-center h-full text-white text-center px-4">
                <p className="tracking-[6px] text-gray-300">LIMITED OFFER</p>

                <h1 className="text-6xl md:text-8xl font-black mt-4">50% OFF</h1>

                <p className="mt-6 text-lg md:text-xl text-gray-200">ON SELECTED COLLECTIONS</p>

                {/* BUTTON */}
                <button
                    onClick={handleExplore}
                    className="mt-10 bg-white text-black px-10 py-4 rounded-md font-bold hover:bg-gray-200 transition">
                    EXPLORE NOW
                </button>
            </div>
        </div>
    );
}

export default OfferBanner;
