const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row gy-4">
          <div className="col-md-4">
            <h5>FlavorNest Kitchen</h5>
            <p>Fresh flavors, warm hospitality, and unforgettable dining experiences.</p>
          </div>
          <div className="col-md-4">
            <h5>Quick Links</h5>
            <ul>
              <li>Menu</li>
              <li>About us</li>
              <li>Contact</li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5>Contact</h5>
            <p>+91 98765 43210</p>
            <p>hello@flavornest.com</p>
            <p>Mon-Sun: 9:00 AM - 11:00 PM</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
