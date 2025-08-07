import TourismMap from '@/components/TourismMap';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            Panel de Pronósticos de Turismo
          </h1>
          <p className="text-lg text-muted-foreground">Julio 2024 - Regiones de España</p>
        </header>
        <TourismMap />
      </div>
    </div>
  );
};

export default Index;
