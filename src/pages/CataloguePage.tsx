const CataloguePage = () => {
  return (
    <main className="bg-white">
      <iframe
        src="/Catelog.html"
        title="Order Kaaro Catalogue"
        className="w-full"
        style={{ height: 'calc(100vh)', border: 'none' }}
        loading="lazy"
      />
    </main>
  );
};

export default CataloguePage;