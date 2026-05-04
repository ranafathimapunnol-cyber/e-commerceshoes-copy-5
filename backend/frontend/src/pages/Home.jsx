import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import Categories from '../components/Home/Categories';
import Featured from '../components/home/Featured';
import OfferBanner from '../components/home/OfferBanner';
import Footer from '../components/layout/Footer';
import VideoShowcase from '../components/home/VideoShowcase';

function Home() {
    return (
        <div>
            <Navbar />

            <Hero />

            <Categories />

            <VideoShowcase />

            <Featured />

            <OfferBanner />

            <Footer />
        </div>
    );
}

export default Home;
