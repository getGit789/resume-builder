import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  const fontData = await fetch(
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  ).then((res) => res.text());

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          padding: '40px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          marginBottom: '30px',
          alignItems: 'flex-start'
        }}>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#111' }}>John Doe</div>
          <div style={{ fontSize: '20px', fontWeight: 500, color: '#777', marginTop: '5px' }}>
            Senior Software Engineer
          </div>
          <div style={{ height: '1px', width: '100%', backgroundColor: '#ddd', marginTop: '20px' }} />
        </div>

        {/* Contact Info */}
        <div style={{ 
          display: 'flex', 
          width: '100%', 
          justifyContent: 'space-between', 
          fontSize: '14px',
          color: '#555',
          marginBottom: '30px'
        }}>
          <div>john.doe@example.com</div>
          <div>(555) 123-4567</div>
          <div>San Francisco, CA</div>
          <div>github.com/johndoe</div>
        </div>

        {/* Experience */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          width: '100%', 
          marginBottom: '25px' 
        }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#e11d48', marginBottom: '15px' }}>
            EXPERIENCE
          </div>
          
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '20px' 
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '5px' 
            }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#333' }}>Tech Company Inc.</div>
              <div style={{ fontSize: '14px', color: '#555' }}>2019 - Present</div>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 500, color: '#444', marginBottom: '5px' }}>
              Senior Software Engineer
            </div>
            <div style={{ fontSize: '14px', color: '#555', lineHeight: 1.5 }}>
              • Led development of a React-based application
            </div>
            <div style={{ fontSize: '14px', color: '#555', lineHeight: 1.5 }}>
              • Implemented CI/CD pipeline reducing deployment time
            </div>
          </div>
        </div>

        {/* Skills */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          width: '100%' 
        }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#e11d48', marginBottom: '15px' }}>
            SKILLS
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '10px',
            fontSize: '14px',
            flexWrap: 'wrap'
          }}>
            <div style={{ 
              backgroundColor: '#f3f4f6', 
              padding: '6px 12px', 
              borderRadius: '4px',
              color: '#333'
            }}>
              JavaScript
            </div>
            <div style={{ 
              backgroundColor: '#f3f4f6', 
              padding: '6px 12px', 
              borderRadius: '4px',
              color: '#333'
            }}>
              TypeScript
            </div>
            <div style={{ 
              backgroundColor: '#f3f4f6', 
              padding: '6px 12px', 
              borderRadius: '4px',
              color: '#333'
            }}>
              React
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 800,
      headers: {
        'content-type': 'image/png',
        'cache-control': 'public, max-age=31536000, immutable',
      },
    },
  );
} 