import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, ArrowRight, Utensils, Star, LocateFixed, Loader, X, ChevronRight } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [ratingModal, setRatingModal] = useState({ isOpen: false, restaurantId: null, restaurantName: '' });
  const [hoveredStar, setHoveredStar] = useState(0);

  const filteredRestaurants = restaurants.filter(restaurant => {
    if(!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
        restaurant.name?.toLowerCase().includes(query) || 
        restaurant.address?.toLowerCase().includes(query) ||
        restaurant.cuisineType?.toLowerCase().includes(query)
    );
  });

  const handleSearch = () => {
      setSearchQuery(location);
      document.getElementById('restaurants-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                if (data && data.display_name) {
                    setLocation(data.display_name);
                } else {
                    setLocation(`${latitude}, ${longitude}`);
                }
            } catch (err) {
                setLocation(`${latitude}, ${longitude}`);
            } finally {
                setLocationLoading(false);
            }
        },
        () => {
            alert("Unable to retrieve your location. Please ensure tracking permissions are granted.");
            setLocationLoading(false);
        }
    );
  };

  const handleOpenRating = (e, restaurant) => {
      e.preventDefault();
      e.stopPropagation();
      
      const userId = localStorage.getItem('userId');
      if(!userId) {
          alert('Please sign in to rate restaurants.');
          return;
      }
      
      setRatingModal({ isOpen: true, restaurantId: restaurant._id, restaurantName: restaurant.name });
  };

  const submitRating = async (score) => {
      const userId = localStorage.getItem('userId');
      try {
          const res = await api.post(`/restaurants/${ratingModal.restaurantId}/rate`, { userId, score });
          setRestaurants(prev => prev.map(r => r._id === ratingModal.restaurantId ? { ...r, averageRating: res.data.averageRating } : r));
          setRatingModal({ isOpen: false, restaurantId: null, restaurantName: '' });
      } catch (err) {
          console.error(err);
          alert('Failed to submit your rating.');
      }
  };

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await api.get('/restaurants');
        setRestaurants(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
         <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl animate-fade-in-up mt-8">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 transition-transform duration-[10s] hover:scale-105"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        
        <div className="relative px-8 py-24 md:py-32 flex flex-col items-center justify-center text-center">
          <span className="bg-white/10 backdrop-blur-md border border-white/20 text-primary-400 font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider mb-6 animate-fade-in-up stagger-1 shadow-lg">
            Reimagining Delivery
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight animate-fade-in-up stagger-2">
            The food you love, <br/>
            <span className="text-gradient drop-shadow-lg">delivered instantly.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 animate-fade-in-up stagger-3 font-medium">
            Explore hundreds of highly curated local restaurants and artisan kitchens right in your neighborhood.
          </p>
          <div className="flex w-full max-w-lg bg-white rounded-full p-2 shadow-[0_0_40px_rgba(0,0,0,0.3)] animate-fade-in-up stagger-4 mx-auto transform transition-transform focus-within:scale-105">
            <div className="flex-1 flex items-center px-4">
              <button 
                type="button" 
                onClick={handleGetLocation}
                disabled={locationLoading} 
                className={`mr-3 transition-colors ${locationLoading ? 'text-primary-400' : 'text-primary-500 hover:text-primary-600 bg-primary-50 rounded-full p-1.5'}`}
                title="Use current GPS location"
              >
                {locationLoading ? <Loader className="w-5 h-5 animate-spin" /> : <LocateFixed className="w-5 h-5" />}
              </button>
              <input 
                type="text" 
                placeholder="Enter your delivery address or search..." 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-transparent outline-none text-slate-700 font-bold placeholder-slate-400" 
               />
            </div>
            <button 
                onClick={handleSearch}
                className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-bold px-8 py-3.5 rounded-full transition-all hidden sm:block shadow-md">
              {user?.role === 'admin' ? 'Find Restaurant' : 'Find Food'}
            </button>
          </div>
        </div>
      </div>

      {/* Restaurants Section */}
      <div id="restaurants-section" className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Trending Spots</h2>
            <p className="text-slate-500 mt-2 font-medium">Discover top-rated restaurants near you</p>
          </div>
          <button onClick={() => setSearchQuery('')} className="hidden sm:flex items-center text-primary-600 font-bold hover:text-primary-700 transition-colors bg-primary-50 px-4 py-2 rounded-full">
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="flex justify-center flex-col items-center h-64 bg-white rounded-3xl border border-dashed border-gray-300">
             <div className="text-gray-400 font-bold text-lg mb-2">No spots found matching your search.</div>
             <button onClick={() => { setLocation(''); setSearchQuery(''); }} className="text-primary-600 font-bold hover:underline">Clear Search</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((restaurant, index) => (
              <Link 
                key={restaurant._id} 
                to={`/menu/${restaurant._id}`}
                className={`group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up stagger-${(index % 4) + 1}`}
              >
                <div className="h-64 bg-slate-50 relative overflow-hidden">
                  {restaurant.image ? (
                    <img 
                      src={`http://localhost:3000/uploads/${restaurant.image}`} 
                      alt={restaurant.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      onError={(e) => {
                         e.target.onerror = null; // Prevent infinite loop
                         e.target.src = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2070&auto=format&fit=crop"; // Better fallback
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Utensils className="h-16 w-16 text-slate-200 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <button 
                    onClick={(e) => handleOpenRating(e, restaurant)}
                    title="Click to rate this restaurant"
                    className="absolute top-4 right-4 bg-white/95 hover:bg-white backdrop-blur shadow-xl px-3 py-1.5 rounded-full flex items-center z-10 hover:scale-105 transition-all cursor-pointer border border-white/20">
                    <Star className={`w-4 h-4 ${restaurant.averageRating > 0 ? 'text-orange-400 fill-current mr-1.5' : 'text-slate-300 mr-1.5'}`} />
                    <span className="text-sm font-black text-slate-800">
                      {restaurant.averageRating > 0 ? restaurant.averageRating.toFixed(1) : 'NEW'}
                    </span>
                  </button>
                  
                  {restaurant.cuisineType && (
                    <span className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                      {restaurant.cuisineType}
                    </span>
                  )}
                </div>
                
                <div className="p-7 relative">
                  <div className="absolute -top-7 right-7 w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-50 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-12">
                    <ArrowRight className="w-6 h-6 text-slate-900 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2 truncate group-hover:text-primary-600 transition-colors tracking-tight">{restaurant.name}</h3>
                  <div className="flex items-center text-slate-500 mb-6 bg-slate-50 p-2 rounded-xl border border-slate-100/50">
                     <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                     <span className="text-xs font-bold truncate">{restaurant.address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                           <div key={i} className={`w-7 h-7 rounded-full border-2 border-white bg-slate-${i+1}00 flex items-center justify-center text-[10px] font-bold text-slate-600`}>
                             {String.fromCharCode(64+i)}
                           </div>
                        ))}
                     </div>
                     <span className="text-xs font-black text-primary-600 uppercase tracking-widest flex items-center">
                       View Selection <ChevronRight className="w-3 h-3 ml-1" />
                     </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Rating Modal Overlay */}
      {ratingModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full mx-4 shadow-2xl relative transform transition-all">
             <button onClick={() => setRatingModal({isOpen: false, restaurantId: null, restaurantName: ''})} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full p-2">
                <X className="w-5 h-5" />
             </button>
             
             <div className="text-center mb-6 mt-4">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 outline outline-4 outline-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                   <Star className="w-10 h-10 text-orange-400 fill-current" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Rate your visit</h3>
                <p className="text-slate-500 mt-2 font-medium text-sm">How was your meal at <span className="text-slate-800 font-bold">{ratingModal.restaurantName}</span>?</p>
             </div>
             
             <div className="flex justify-center space-x-1 mb-2 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                {[1, 2, 3, 4, 5].map(star => (
                   <button 
                     key={star}
                     onMouseEnter={() => setHoveredStar(star)}
                     onMouseLeave={() => setHoveredStar(0)}
                     onClick={() => submitRating(star)}
                     className="transition-transform hover:scale-110 hover:-translate-y-1 focus:outline-none p-1 cursor-pointer"
                   >
                     <Star className={`w-10 h-10 transition-colors ${star <= hoveredStar ? 'text-orange-400 fill-current' : 'text-slate-200 hover:text-orange-200'}`} />
                   </button>
                ))}
             </div>
             <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mt-6">Tap a star to submit</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
