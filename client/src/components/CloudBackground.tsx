const clouds = [
  { width: 260, height: 80,  top: '8%',  duration: '65s', delay: '0s'   },
  { width: 180, height: 55,  top: '18%', duration: '50s', delay: '-18s'  },
  { width: 300, height: 90,  top: '32%', duration: '80s', delay: '-35s'  },
  { width: 140, height: 45,  top: '22%', duration: '45s', delay: '-8s'   },
  { width: 220, height: 68,  top: '50%', duration: '70s', delay: '-50s'  },
  { width: 160, height: 50,  top: '62%', duration: '55s', delay: '-25s'  },
  { width: 280, height: 85,  top: '72%', duration: '75s', delay: '-42s'  },
  { width: 120, height: 38,  top: '42%', duration: '40s', delay: '-12s'  },
];

export function CloudBackground() {
  return (
    <>
      {clouds.map((c, i) => (
        <div
          key={i}
          className="cloud"
          style={{
            top: c.top,
            animation: `drift ${c.duration} ${c.delay} linear infinite`,
          }}
        >
          <div
            className="cloud-shape"
            style={{ width: c.width, height: c.height }}
          />
        </div>
      ))}
    </>
  );
}
