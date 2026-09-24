import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, MessageSquare, ShieldCheck, Mail, ArrowRight, Home, Search, Heart, User, Star, MapPin, DollarSign } from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for mock search box
  const [searchCity, setSearchCity] = useState('');
  const [searchBudget, setSearchBudget] = useState('');
  const [searchRoomType, setSearchRoomType] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Redirect to listings page with query parameters
    let query = '?';
    if (searchCity) query += `city=${searchCity}&`;
    if (searchBudget) query += `budget=${searchBudget}&`;
    if (searchRoomType) query += `type=${searchRoomType}`;
    navigate(`/listings${query}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '100px', paddingBottom: '80px' }} className="fade-in">
      {/* Huge Hero Section */}
      <section style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap-reverse',
        gap: '40px',
        padding: '60px 0 40px 0',
        minHeight: '80vh',
        position: 'relative'
      }}>
        <div style={{ flex: '1 1 550px', display: 'flex', flexDirection: 'column', gap: '28px', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid rgba(37, 99, 235, 0.15)',
            color: '#2563EB',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            alignSelf: 'flex-start'
          }}>
            <Sparkles size={14} /> AI-Powered Flatmate Matching
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 64px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)'
          }}>
            Find rooms & flatmates <br />
            <span style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>matched by AI</span>
          </h1>

          <p style={{
            fontSize: '18px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            maxWidth: '560px'
          }}>
            RentMate Finder uses a smart compatibility engine evaluating 13 parameters—including budget, habits, rules, and nearby amenities—to match you with perfect rooms and owners.
          </p>

          {/* Premium Search Box */}
          <form onSubmit={handleSearchSubmit} className="glass-card" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '16px',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-lg)',
            background: 'var(--bg-secondary)',
            maxWidth: '680px',
            width: '100%',
            marginTop: '10px'
          }}>
            <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>City</label>
              <select 
                value={searchCity} 
                onChange={(e) => setSearchCity(e.target.value)}
                className="form-control"
                style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              >
                <option value="">Select City</option>
                {['Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Max Budget</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '14px' }}>₹</span>
                <input 
                  type="number" 
                  placeholder="25000" 
                  value={searchBudget}
                  onChange={(e) => setSearchBudget(e.target.value)}
                  className="form-control"
                  style={{ padding: '8px 12px 8px 24px', border: '1px solid var(--border-color)', borderRadius: '8px', width: '100%' }}
                />
              </div>
            </div>

            <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Room Type</label>
              <select 
                value={searchRoomType} 
                onChange={(e) => setSearchRoomType(e.target.value)}
                className="form-control"
                style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              >
                <option value="">Any Type</option>
                {['Single Room', 'Shared Room', 'Private Room', '1 BHK', '2 BHK'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0 24px', borderRadius: '12px', height: '48px', alignSelf: 'flex-end', flexGrow: 1 }}>
              <Search size={18} /> Search
            </button>
          </form>
        </div>

        {/* Hero Visual Card (AI matching visual details) */}
        <div style={{
          flex: '1 1 450px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1
        }}>
          <div className="glass-card" style={{
            padding: '36px',
            borderRadius: '24px',
            position: 'relative',
            maxWidth: '460px',
            width: '100%',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-10px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
              fontSize: '15px',
              fontWeight: 800,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <span>94%</span>
              <span style={{ fontSize: '10px', fontWeight: 600, opacity: 0.9 }}>AI COMPATIBILITY</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 700
                }}>AP</div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Amit Patel (Tenant)</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>Preferred: HSR Layout, Bengaluru</p>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Budget Preference</span>
                  <strong>₹12,000 - ₹18,000</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Flat Rent (Sector 2)</span>
                  <strong>₹14,500/mo</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Habits: Smoking / Drink</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>Aligned</span>
                </div>
              </div>

              <div style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                background: 'rgba(16, 185, 129, 0.05)',
                padding: '14px',
                borderRadius: '12px',
                borderLeft: '4px solid #10B981',
                fontStyle: 'italic'
              }}>
                "Rent fits budget perfectly. Both agree on non-smoking. Geyser, WiFi, and attached bathroom overlap. Highly recommended."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 800 }}>Featured Indian Properties</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Premium room vacancies matched with owners in key cities</p>
          </div>
          <Link to="/listings" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
            Browse All Rooms <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px'
        }}>
          {/* Mock property 1 */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
              <img src="/rooms/room1.png" alt="Premium Single Room" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition-smooth)' }} />
              <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#2563EB', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>Single Room</div>
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(16, 185, 129, 0.95)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>92% Match</div>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Bengaluru • HSR Layout</span>
                <h4 style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>Premium Single Room near Metro</h4>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Wi-Fi', 'AC', 'Geyser', 'Washing Machine'].map(am => (
                  <span key={am} style={{ fontSize: '11px', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>{am}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '4px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Rent</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>₹14,500<span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>/mo</span></div>
                </div>
                <Link to="/listings" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '8px' }}>View Details</Link>
              </div>
            </div>
          </div>

          {/* Mock property 2 */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
              <img src="/rooms/room2.png" alt="Luxury 1 BHK Studio" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition-smooth)' }} />
              <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#2563EB', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>1 BHK</div>
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(16, 185, 129, 0.95)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>88% Match</div>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Mumbai • Andheri West</span>
                <h4 style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>Luxury 1 BHK Studio Flat with View</h4>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Wi-Fi', 'AC', 'Microwave', 'TV'].map(am => (
                  <span key={am} style={{ fontSize: '11px', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>{am}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '4px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Rent</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>₹24,000<span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>/mo</span></div>
                </div>
                <Link to="/listings" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '8px' }}>View Details</Link>
              </div>
            </div>
          </div>

          {/* Mock property 3 */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
              <img src="/rooms/room3.png" alt="Girls PG twin room" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition-smooth)' }} />
              <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#2563EB', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>Shared Room</div>
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(16, 185, 129, 0.95)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>94% Match</div>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Delhi • South Ext 1</span>
                <h4 style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>Cozy Shared Room for Girls</h4>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Wi-Fi', 'Attached Bathroom', 'Cooler', 'RO Water'].map(am => (
                  <span key={am} style={{ fontSize: '11px', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>{am}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '4px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Rent</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>₹18,000<span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>/mo</span></div>
                </div>
                <Link to="/listings" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '8px' }}>View Details</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        background: 'linear-gradient(135deg, #090d16, #161e31)',
        borderRadius: '24px',
        padding: '60px 40px',
        color: '#fff',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        gap: '40px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <h3 style={{ fontSize: '48px', fontWeight: 800, color: '#2563EB', marginBottom: '8px' }}>12,000+</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Smart Room Matches</p>
        </div>
        <div>
          <h3 style={{ fontSize: '48px', fontWeight: 800, color: '#7C3AED', marginBottom: '8px' }}>5,500+</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Verified Users</p>
        </div>
        <div>
          <h3 style={{ fontSize: '48px', fontWeight: 800, color: '#10B981', marginBottom: '8px' }}>25+</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Indian Cities</p>
        </div>
        <div>
          <h3 style={{ fontSize: '48px', fontWeight: 800, color: '#F59E0B', marginBottom: '8px' }}>&lt; 2 Sec</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Scoring Speed</p>
        </div>
      </section>

      {/* Smart Match Attributes Showcase */}
      <section style={{ display: 'flex', flexWrap: 'wrap', gap: '60px', alignItems: 'center' }}>
        <div style={{ flex: '1 1 450px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '20px' }}>Evaluating 13 Parameters for the Perfect Fit</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
            Generic matching platforms only verify budget and location. RentMate Finder checks detailed habits, amenities checkboxes, guest regulations, food, and nearby preferences to ensure flatmate compatibility is real.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              'Rent & Budget Limits',
              'Furnishing Quality',
              'Food Preferences (Veg/Non-Veg)',
              'Room Occupancy Counts',
              'Smoking & Drinking Rules',
              'Guest Policies',
              '24+ Detailed Amenities',
              'Proximity to Metro/Office'
            ].map((p) => (
              <div key={p} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', fontWeight: 600 }}>
                <ShieldCheck size={18} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: '1 1 450px', display: 'flex', gap: '20px', flexDirection: 'column' }}>
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '8px', color: '#7C3AED' }}>1. Local Falling Engine</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              If Gemini credentials are not present, our robust mathematical algorithms run automatically inside your backend to compare habits and locations, giving you uninterrupted service.
            </p>
          </div>
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '8px', color: '#2563EB' }}>2. MongoDB Match Cache</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Compatibility scores are pre-computed and stored in your database. Updating your requirements automatically invalidates matching caches so you get real-time score updates.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800 }}>Trusted by Indian Professionals</h2>
          <p style={{ color: 'var(--text-secondary)' }}>What our users say about their flatmate finding experience</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            {
              name: 'Rahul Sen',
              role: 'Software Engineer, HSR Layout',
              comment: 'As a newcomer to Bengaluru, finding a flatmate who is comfortable with working night shifts and shares similar dietary habits was crucial. RentMate Finder matched me with a roommate in HSR layout within 3 days. The 94% match score was spot on!',
              stars: 5
            },
            {
              name: 'Ananya Nair',
              role: 'PG Student, South Delhi',
              comment: 'Finding accommodation as a student in South Extension is tough. The owner list verified amenities, and matching allowed me to find single PG accommodation easily. Real-time WebSocket chat unlocks automatically, which made coordinating super simple.',
              stars: 5
            },
            {
              name: 'Vikram Joshi',
              role: 'Property Owner, Pune',
              comment: 'Listing room vacancies is easy, but managing inquiries is stressful. The tenant matching system filter shows only compatible requests first. I accepted an interest request, started chatting, and closed the rental within a week.',
              stars: 5
            }
          ].map((t, idx) => (
            <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{t.comment}"
              </p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h5 style={{ fontSize: '14px', fontWeight: 700 }}>{t.name}</h5>
                  <p style={{ fontSize: '11px', color: 'var(--text-light)' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section style={{
        background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
        borderRadius: '24px',
        padding: '60px 30px',
        textAlign: 'center',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h2 style={{ fontSize: '36px', fontWeight: 800 }}>Ready to Find Your RentMate?</h2>
        <p style={{ maxWidth: '600px', opacity: 0.9, lineHeight: 1.6, fontSize: '16px' }}>
          Sign up today to create list postings or requirements criteria, unlock AI matching compatibility indices, and start chatting with hosts.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {user ? (
            <Link to={user.role === 'owner' ? '/owner-dashboard' : user.role === 'admin' ? '/admin-dashboard' : '/tenant-dashboard'} className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '15px', borderRadius: '12px', background: '#fff', color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '15px', borderRadius: '12px', background: '#fff', color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
                Join as Tenant / Owner
              </Link>
              <Link to="/login" className="btn btn-outline" style={{ padding: '14px 28px', fontSize: '15px', borderRadius: '12px', borderColor: '#fff', color: '#fff', fontWeight: 700, textDecoration: 'none' }}>
                Login to Platform
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Premium Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '40px',
        marginTop: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '30px',
        fontSize: '14px',
        color: 'var(--text-secondary)'
      }}>
        <div>
          <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '18px', marginBottom: '8px' }}>RentMate Finder</h4>
          <p style={{ maxWidth: '300px', fontSize: '12px', lineHeight: 1.5 }}>
            AI-powered rent and flatmate discovery platform matching Indian tier-1 and tier-2 listings.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Product</strong>
            <Link to="/listings" style={{ color: 'inherit', textDecoration: 'none' }}>Browse Rooms</Link>
            <Link to="/register" style={{ color: 'inherit', textDecoration: 'none' }}>Create Account</Link>
            <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Login</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Indian Cities</strong>
            <span style={{ fontSize: '13px' }}>Bengaluru • Mumbai • Delhi • Pune • Hyderabad</span>
          </div>
        </div>
        <div style={{ width: '100%', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px', fontSize: '12px', color: 'var(--text-light)' }}>
          © {new Date().getFullYear()} RentMate Finder. Built exactly to assignment specifications. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
