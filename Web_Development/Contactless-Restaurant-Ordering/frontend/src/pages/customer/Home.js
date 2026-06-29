import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCamera, FiShoppingCart, FiCheck, FiPackage } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { ScaleOnHover, FadeIn, StaggerContainer, StaggerItem, CountUp } from '../../components/PageTransition';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const [categories, setCategories] = React.useState([]);
  const [featuredProducts, setFeaturedProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const heroRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroSubRef = useRef(null);
  const heroBtnRef = useRef(null);
  const stepsRef = useRef(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=6'),
        ]);
        const catData = catRes.data;
        const prodData = prodRes.data;
        setCategories(Array.isArray(catData) ? catData : catData.categories || []);
        setFeaturedProducts((Array.isArray(prodData) ? prodData : prodData.products || []).slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      // Hero text animation
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from(heroTitleRef.current, { y: 60, opacity: 0, duration: 1 })
        .from(heroSubRef.current, { y: 40, opacity: 0, duration: 0.8 }, '-=0.5')
        .from(heroBtnRef.current.children, { y: 30, opacity: 0, stagger: 0.2, duration: 0.6 }, '-=0.4');

      // Hero floating shapes
      gsap.to('.hero-shape-1', { y: -20, rotation: 10, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.hero-shape-2', { y: 20, rotation: -10, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 });
      gsap.to('.hero-shape-3', { y: -15, rotation: 5, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.5 });

      // ScrollTrigger for categories
      gsap.from('.category-card', {
        scrollTrigger: { trigger: '.categories-section', start: 'top 80%', toggleActions: 'play none none none' },
        y: 60, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out',
      });

      // ScrollTrigger for products
      gsap.from('.product-card', {
        scrollTrigger: { trigger: '.products-section', start: 'top 80%', toggleActions: 'play none none none' },
        y: 60, opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.1, ease: 'power2.out',
      });

      // ScrollTrigger for how-it-works steps
      gsap.from('.step-item', {
        scrollTrigger: { trigger: stepsRef.current, start: 'top 80%', toggleActions: 'play none none none' },
        y: 50, opacity: 0, duration: 0.6, stagger: 0.2, ease: 'power2.out',
      });

      // ScrollTrigger for stats section
      gsap.from('.stat-item', {
        scrollTrigger: { trigger: '.stats-section', start: 'top 85%', toggleActions: 'play none none none' },
        scale: 0.8, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)',
      });
    });

    return () => ctx.revert();
  }, [loading]);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-24 md:py-32 overflow-hidden">
        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-shape-1 absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-sm" />
          <div className="hero-shape-2 absolute top-40 right-20 w-32 h-32 bg-white/5 rounded-2xl rotate-45" />
          <div className="hero-shape-3 absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full" />
          <div className="hero-shape-1 absolute bottom-40 right-1/3 w-24 h-24 bg-white/5 rounded-full" />
          <div className="hero-shape-2 absolute top-1/3 left-1/3 w-12 h-12 bg-white/10 rounded-lg rotate-12" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
              Contactless Ordering System
            </span>
          </motion.div>

          <h1 ref={heroTitleRef} className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Contactless Ordering
            <br />
            <span className="text-primary-200">Made Easy</span>
          </h1>

          <p ref={heroSubRef} className="text-xl md:text-2xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Scan the QR code at your table to browse our menu and order seamlessly — no physical menus needed
          </p>

          <div ref={heroBtnRef} className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/menu"
                className="bg-white text-primary-700 hover:bg-primary-50 font-semibold py-3 px-8 rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-lg"
              >
                <FiShoppingCart />
                <span>Browse Menu</span>
                <FiArrowRight />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/scan"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-700 font-semibold py-3 px-8 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <FiCamera />
                <span>Scan QR Code</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 50, suffix: '+', label: 'Menu Items' },
              { value: 10, suffix: '+', label: 'Tables' },
              { value: 100, suffix: '%', label: 'Contactless' },
              { value: 4, suffix: '.8', label: 'App Rating' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="stat-item text-center"
                whileHover={{ y: -5 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-500">
                  <CountUp target={stat.value} duration={2} />{stat.suffix}
                </div>
                <div className="text-secondary-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-3xl font-bold text-secondary-900 text-center mb-4">Our Categories</h2>
            <p className="text-secondary-500 text-center mb-12">Explore our wide range of delicious options</p>
          </FadeIn>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-secondary-200 animate-pulse h-40 rounded-xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category, i) => (
                <ScaleOnHover key={category.id}>
                  <Link
                    to={`/menu?category=${category.id}`}
                    className="category-card block bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                  >
                    <div className="h-32 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center group-hover:from-primary-500 group-hover:to-primary-700 transition-all relative overflow-hidden">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div className={`${category.image_url ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                        <span className="text-white text-4xl font-bold group-hover:scale-110 transition-transform">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 text-center">
                      <h3 className="font-semibold text-secondary-800 text-sm group-hover:text-primary-500 transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                </ScaleOnHover>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Items Section */}
      <section className="products-section py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-3xl font-bold text-secondary-900 text-center mb-4">Popular Items</h2>
            <p className="text-secondary-500 text-center mb-12">Our most loved dishes, freshly prepared</p>
          </FadeIn>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white animate-pulse h-64 rounded-xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ScaleOnHover key={product.id}>
                  <div className="product-card bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center relative overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div className={`${product.image_url ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                        <motion.span
                          className="text-white text-6xl font-bold"
                          whileHover={{ scale: 1.2, rotate: 5 }}
                        >
                          {product.name.charAt(0)}
                        </motion.span>
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-primary-600 font-bold text-sm">₹{product.price?.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg text-secondary-800">{product.name}</h3>
                      {product.description && (
                        <p className="text-secondary-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                      )}
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-primary-500 font-bold text-xl">₹{product.price?.toFixed(2)}</span>
                        <Link
                          to="/menu"
                          className="text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center space-x-1 group"
                        >
                          <span>View Menu</span>
                          <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </ScaleOnHover>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={stepsRef} className="py-20 bg-secondary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
            <p className="text-secondary-400 text-center mb-16">Three simple steps to your meal</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: FiCamera, title: 'Scan QR Code', desc: 'Find the QR code on your table and scan it with your phone camera' },
              { icon: FiShoppingCart, title: 'Browse & Order', desc: 'Explore our menu, customize your items, and add them to cart' },
              { icon: FiPackage, title: 'Enjoy Your Meal', desc: "We'll prepare your order and bring it right to your table" },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="step-item text-center"
                whileHover={{ y: -10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6 relative"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <step.icon className="text-white text-3xl" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-white text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </span>
                </motion.div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-secondary-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Try QR Ordering Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-3xl font-bold text-secondary-900 text-center mb-4">Try QR Ordering Now</h2>
            <p className="text-secondary-500 text-center mb-4">Scan any QR code below with your phone to experience the full ordering flow</p>
            <p className="text-secondary-400 text-center text-sm mb-12">Or click the table links to open directly on this device</p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { table: 'T1', section: 'Indoor', capacity: 4 },
              { table: 'T2', section: 'Indoor', capacity: 2 },
              { table: 'T3', section: 'Outdoor', capacity: 6 },
            ].map((t, i) => (
              <motion.div
                key={t.table}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
                className="bg-white rounded-2xl shadow-md p-6 text-center"
              >
                <div className="mb-3">
                  <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Table {t.table}
                  </span>
                </div>
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-3 rounded-xl border border-secondary-100 shadow-sm">
                    <QRCodeSVG
                      value={`${window.location.origin}/scan?table=${t.table}`}
                      size={140}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                </div>
                <p className="text-secondary-500 text-sm mb-1">{t.section} · {t.capacity} seats</p>
                <Link
                  to={`/scan?table=${t.table}`}
                  className="inline-block mt-3 text-primary-500 hover:text-primary-600 text-sm font-medium"
                >
                  Open on this device →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Order?</h2>
            <p className="text-xl text-primary-100 mb-8">
              Experience the future of dining — contactless, fast, and seamless
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link
                to="/menu"
                className="bg-white text-primary-600 hover:bg-primary-50 font-bold py-4 px-10 rounded-lg inline-flex items-center space-x-2 transition-colors shadow-lg text-lg"
              >
                <span>Start Ordering Now</span>
                <FiArrowRight />
              </Link>
            </motion.div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
};

export default Home;
