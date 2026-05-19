import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#0f172a',
          color: '#f8fafc',
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: '-0.03em'
        }}
      >
        <div>Product Gym</div>
        <div style={{ marginTop: 24, fontSize: 36, fontWeight: 400, color: '#cbd5e1' }}>
          Practice product thinking
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
