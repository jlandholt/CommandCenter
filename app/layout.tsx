import Nav from './Nav'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui' }}>
        <Nav />
        <div className="page-content">{children}</div>

        <style>{`
          /* Desktop: sidebar on the left, content pushed over */
          .side-nav {
            position: fixed; top: 0; left: 0; bottom: 0; width: 200px;
            border-right: 1px solid #eee; padding: 20px 12px; box-sizing: border-box;
          }
          .bottom-nav { display: none; }
          .page-content { margin-left: 200px; }

          /* Phone: hide sidebar, show bottom bar lifted above Safari */
          @media (max-width: 700px) {
            .side-nav { display: none; }
            .page-content { margin-left: 0; padding-bottom: 90px; }
            .bottom-nav {
              display: flex; justify-content: space-around; align-items: center;
              position: fixed; left: 0; right: 0;
              bottom: 0;
              padding: 10px 0 calc(10px + env(safe-area-inset-bottom));
              background: #fff; border-top: 1px solid #eee;
            }
          }
        `}</style>
      </body>
    </html>
  )
}
