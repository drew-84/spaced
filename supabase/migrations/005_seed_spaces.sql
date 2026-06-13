-- Migration 005: seed spaces
-- Inserts the 11 original mock listings so the app is not empty after launch.
-- host_id is null for seeded spaces (no real host yet).

insert into public.spaces
  (title, description, type, stay_type, area, city, lat, lng,
   price_per_30m, price_per_night, min_nights,
   instant_access, amenities, image_url, rating, review_count)
values
  (
    'Quiet Loft - Roma Norte',
    'Loft moderno y discreto en el corazon de Roma Norte. Ambiente intimo con iluminacion ambiental, cama king size y bano privado. Acceso con codigo digital.',
    'studio', 'hourly', 'Roma Norte', 'Ciudad de México', 19.4194, -99.1619,
    14, null, null, true,
    ARRAY['Wi-Fi','Aire acondicionado','Cama King','Bano privado','Cerradura digital','Toallas'],
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80',
    4.8, 124
  ),
  (
    'Private Room - Condesa',
    'Habitacion privada en zona tranquila de la Condesa. Decoracion minimalista, muy limpia y con todo lo necesario para un momento de privacidad.',
    'private-room', 'hourly', 'Condesa', 'Ciudad de México', 19.4111, -99.1722,
    12, null, null, true,
    ARRAY['Wi-Fi','Aire acondicionado','Cama Queen','Bano privado','Cerradura digital'],
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80',
    4.6, 89
  ),
  (
    '1BR Apartment - Juarez',
    'Apartamento completo de 1 recamara con sala, cocina y bano. Ideal para quienes buscan mas espacio y comodidad. Terraza privada con vista.',
    'apartment-1br', 'hourly', 'Juarez', 'Ciudad de México', 19.4260, -99.1677,
    18, null, null, true,
    ARRAY['Wi-Fi','Aire acondicionado','Cama King','Cocina','Terraza','Smart TV','Cerradura digital','Toallas'],
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
    4.9, 203
  ),
  (
    'Suite Romantica - Polanco',
    'Suite de lujo con jacuzzi privado e iluminacion ambiental. Decoracion romantica, sabanas de algodon egipcio y amenidades premium.',
    'private-room', 'hourly', 'Polanco', 'Ciudad de México', 19.4336, -99.1959,
    22, null, null, true,
    ARRAY['Jacuzzi','Iluminacion ambiental','Cama King','Sabanas premium','Bano de lujo','Cerradura digital','Champagne disponible'],
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
    4.9, 156
  ),
  (
    'Cozy Studio - Coyoacan',
    'Estudio acogedor en zona residencial de Coyoacan. Ambiente tranquilo y privado, ideal para quienes buscan algo mas relajado y economico.',
    'studio', 'hourly', 'Coyoacan', 'Ciudad de México', 19.3467, -99.1619,
    10, null, null, false,
    ARRAY['Wi-Fi','Ventilador','Cama Double','Bano privado','Lockbox'],
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80',
    4.3, 67
  ),
  (
    'Penthouse View - Santa Fe',
    'Penthouse exclusivo con vista panoramica a la ciudad. Decoracion de disenador, cama premium y amenidades de hotel 5 estrellas.',
    'apartment-1br', 'hourly', 'Santa Fe', 'Ciudad de México', 19.3657, -99.2594,
    28, null, null, true,
    ARRAY['Vista panoramica','Jacuzzi','Cama King','Smart TV 65','Mini bar','Bano doble','Cerradura digital','Room service disponible'],
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
    5.0, 42
  ),
  (
    'Neon Room - Centro',
    'Habitacion tematica con iluminacion neon y decoracion moderna. Muy popular entre parejas jovenes. Musica ambiental y luces RGB controlables.',
    'private-room', 'hourly', 'Centro Historico', 'Ciudad de México', 19.4326, -99.1332,
    15, null, null, true,
    ARRAY['Luces RGB','Bluetooth speaker','Cama King','Bano privado','Cerradura digital','Espejo de cuerpo completo'],
    'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&q=80',
    4.7, 198
  ),
  (
    'Garden Suite - Del Valle',
    'Estudio con jardin privado interior. Ambiente natural y relajante con plantas, fuente de agua y luz natural. Perfecto para desconectar.',
    'studio', 'hourly', 'Del Valle', 'Ciudad de México', 19.3867, -99.1625,
    16, null, null, true,
    ARRAY['Jardin privado','Fuente de agua','Cama Queen','Bano privado','Cerradura digital','Te y cafe incluido'],
    'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=600&q=80',
    4.5, 93
  ),
  (
    'Casa con patio - Narvarte',
    'Casa de dos niveles con patio, cocina equipada y dos recamaras. Renta por noches para estancias cortas; ideal si buscas una base tranquila y bien ubicada.',
    'house', 'nightly', 'Narvarte', 'Ciudad de México', 19.3952, -99.1597,
    null, 1890, 2, false,
    ARRAY['Wi-Fi','Cocina completa','Lavadora','Patio','Estacionamiento 1 auto','Cerradura inteligente'],
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
    4.8, 31
  ),
  (
    'Depto 1 rec. - corta estancia - Napoles',
    'Departamento de una recamara listo para estancias de unos dias. Edificio con seguridad, cerca de transporte y comercio.',
    'apartment-1br', 'nightly', 'Napoles', 'Ciudad de México', 19.3942, -99.1687,
    null, 1450, 1, true,
    ARRAY['Wi-Fi','Aire acondicionado','Cocina','Gym en edificio','Recepcion 24h'],
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
    4.6, 54
  ),
  (
    'Casa adosada - Sur',
    'Casa adosada en zona residencial: tres recamaras, ideal para grupos pequeños que necesitan varias noches seguidas.',
    'house', 'nightly', 'Tlalpan', 'Ciudad de México', 19.2897, -99.1633,
    null, 1280, 3, false,
    ARRAY['Wi-Fi','Cocina','Estacionamiento','Jardin trasero','Parrilla'],
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
    4.4, 19
  );
