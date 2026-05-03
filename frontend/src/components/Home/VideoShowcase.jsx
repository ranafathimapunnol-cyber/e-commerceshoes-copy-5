import React from 'react';
import { useNavigate } from 'react-router-dom';

function VideoShowcase() {
    const navigate = useNavigate();

    const videos = [
        {
            src: '/videos/v1.mp4',
            title: 'RUN FAST',
            subtitle: 'Built for speed',
        },
        {
            src: '/videos/v2.mp4',
            title: 'STREET STYLE',
            subtitle: 'Modern fashion',
        },
        {
            src: '/videos/v3.mp4',
            title: 'LIMITLESS',
            subtitle: 'Feel the comfort',
        },
        {
            src: '/videos/v4.mp4',
            title: 'NEW ERA',
            subtitle: 'Premium collection',
        },
    ];

    const handleShopNow = () => {
        const userInfo = localStorage.getItem('userInfo');

        if (!userInfo) {
            navigate('/login');
        } else {
            navigate('/products');
        }
    };

    return (
        <section className="bg-white py-24 px-6 md:px-16">
            {/* HEADING */}
            <div className="text-center mb-16">
                <h2 className="text-5xl md:text-7xl font-black text-black tracking-tight">EXPLORE IN MOTION</h2>

                <p className="text-gray-500 text-lg mt-5">Performance meets fashion in every step.</p>
            </div>

            {/* VIDEO CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {videos.map((video, index) => (
                    <div
                        key={index}
                        className="group relative overflow-hidden rounded-[30px] bg-gray-100 shadow-xl hover:shadow-2xl transition duration-500">
                        {/* VIDEO */}
                        <video
                            src={video.src}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-[450px] object-cover group-hover:scale-110 transition duration-700"
                        />

                        {/* OVERLAY */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                        {/* CONTENT */}
                        <div className="absolute bottom-0 left-0 p-8 text-white">
                            <p className="text-sm uppercase tracking-[4px] text-gray-300">RAPIDO</p>

                            <h3 className="text-4xl font-black mt-3 leading-tight">{video.title}</h3>

                            <p className="text-gray-200 mt-3 text-lg">{video.subtitle}</p>

                            <button
                                onClick={handleShopNow}
                                className="mt-6 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition">
                                Shop Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default VideoShowcase;
