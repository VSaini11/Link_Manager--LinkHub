import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          position: 'relative',
        }}
      >
        {/* LinkHub icon - chain links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
          }}
        >
          {/* First link */}
          <div
            style={{
              width: '8px',
              height: '8px',
              border: '2px solid white',
              borderRadius: '50%',
            }}
          />
          {/* Connection */}
          <div
            style={{
              width: '6px',
              height: '2px',
              background: 'white',
            }}
          />
          {/* Second link */}
          <div
            style={{
              width: '8px',
              height: '8px',
              border: '2px solid white',
              borderRadius: '50%',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
