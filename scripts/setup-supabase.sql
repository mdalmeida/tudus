-- Tabla principal de tudús
CREATE TABLE IF NOT EXISTS tudus (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo      text NOT NULL DEFAULT '',
  tipo        text NOT NULL DEFAULT 'Tarea',
  categoria   text NOT NULL DEFAULT 'Inbox',
  estado      text NOT NULL DEFAULT 'Por hacer',
  cuando      text NOT NULL DEFAULT 'Sin fecha',
  deadline    date,
  color       text NOT NULL DEFAULT '',
  tamano      text NOT NULL DEFAULT 'M',
  etiquetas   text[] NOT NULL DEFAULT '{}',
  contenido   text NOT NULL DEFAULT '',
  eliminado   boolean NOT NULL DEFAULT false,
  orden       integer NOT NULL DEFAULT 0,
  pos_x       real NOT NULL DEFAULT 0,
  pos_y       real NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Índices para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_tudus_eliminado ON tudus (eliminado);
CREATE INDEX IF NOT EXISTS idx_tudus_categoria ON tudus (categoria);
CREATE INDEX IF NOT EXISTS idx_tudus_orden ON tudus (orden);

-- Row Level Security: permitir todo desde el cliente anon (app personal)
ALTER TABLE tudus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon" ON tudus
  FOR ALL
  USING (true)
  WITH CHECK (true);
