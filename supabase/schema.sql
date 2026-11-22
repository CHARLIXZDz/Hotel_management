-- ============================================================
-- Supabase Schema: Hotel Management & Booking System
-- ============================================================

-- 1. Create Profiles table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'guest' CHECK (role IN ('guest', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'guest')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Create Room Types table
CREATE TABLE IF NOT EXISTS public.room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price_per_night NUMERIC(10, 2) NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    bed_type TEXT DEFAULT 'King Bed',
    size_sqm INT DEFAULT 35,
    total_rooms INT NOT NULL DEFAULT 5,
    amenities TEXT[] DEFAULT ARRAY['Free High-Speed Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Private Bathroom', 'Complimentary Breakfast'],
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room types are viewable by everyone" 
ON public.room_types FOR SELECT USING (is_active = true OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can insert room types" 
ON public.room_types FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update room types" 
ON public.room_types FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete room types" 
ON public.room_types FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Create Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    room_type_id UUID REFERENCES public.room_types(id) ON DELETE RESTRICT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    num_guests INT NOT NULL DEFAULT 1,
    num_rooms INT NOT NULL DEFAULT 1,
    total_nights INT NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    payment_method TEXT DEFAULT 'pay_at_property',
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'checked_in', 'checked_out', 'cancelled')),
    special_requests TEXT,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_dates CHECK (check_out > check_in)
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings or Admin view all" 
ON public.bookings FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Authenticated users can create bookings" 
ON public.bookings FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

CREATE POLICY "Users or Admins can update bookings" 
ON public.bookings FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Create Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
    room_type_id UUID REFERENCES public.room_types(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Guests can create reviews for their checked_out bookings" 
ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() = user_id AND EXISTS (
        SELECT 1 FROM public.bookings 
        WHERE id = booking_id AND user_id = auth.uid() AND status = 'checked_out'
    )
);

-- 5. Helper Function: Check Room Availability
CREATE OR REPLACE FUNCTION public.check_room_availability(
    target_room_type_id UUID,
    start_date DATE,
    end_date DATE
) RETURNS INT AS $$
DECLARE
    total INT;
    booked INT;
BEGIN
    SELECT total_rooms INTO total 
    FROM public.room_types 
    WHERE id = target_room_type_id AND is_active = true;

    IF total IS NULL THEN
        RETURN 0;
    END IF;

    -- Count overlapping confirmed or checked_in bookings
    SELECT COALESCE(SUM(num_rooms), 0) INTO booked
    FROM public.bookings
    WHERE room_type_id = target_room_type_id
      AND status IN ('confirmed', 'checked_in')
      AND (check_in < end_date AND check_out > start_date);

    RETURN GREATEST(0, total - booked);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Insert Initial Seed Data for Room Types
INSERT INTO public.room_types (name, slug, description, price_per_night, capacity, bed_type, size_sqm, total_rooms, amenities, images)
VALUES 
(
    'Deluxe Ocean Suite',
    'deluxe-ocean-suite',
    'สัมผัสบรรยากาศความหรูหราพร้อมวิวทะเลแบบพาโนรามา ตกแต่งด้วยสไตล์โมเดิร์นทรอปิคอล พร้อมระเบียงส่วนตัวและอ่างจากุซซี่',
    3500.00,
    2,
    'King Bed',
    48,
    4,
    ARRAY['Ocean View Balcony', 'Jacuzzi Bathtub', 'Free High-Speed Wi-Fi', 'Complimentary Breakfast', 'Mini Bar & Espresso Machine', 'Smart TV 55"'],
    ARRAY[
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
    ]
),
(
    'Superior Garden Villa',
    'superior-garden-villa',
    'วิลล่าส่วนตัวท่ามกลางสวนร่มรื่น เงียบสงบ เหมาะสำหรับการพักผ่อนอย่างแท้จริง มีระเบียงนั่งเล่นและฝักบัวเรนชาวเวอร์กลางแจ้ง',
    2400.00,
    2,
    'King Bed or Twin Beds',
    42,
    6,
    ARRAY['Garden View Terrace', 'Rain Shower', 'Free High-Speed Wi-Fi', 'Complimentary Breakfast', 'Mini Fridge', 'Smart TV 43"'],
    ARRAY[
        'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
    ]
),
(
    'Executive Family Suite',
    'executive-family-suite',
    'ห้องพักกว้างขวางสำหรับครอบครัว ประกอบด้วย 2 ห้องนอน 1 ห้องนั่งเล่น พร้อมสิ่งอำนวยความสะดวกครบครันเพื่อความสุขของทุกคนในครอบครัว',
    4800.00,
    4,
    '1 King Bed + 2 Single Beds',
    75,
    3,
    ARRAY['2 Separate Bedrooms', 'Living Room Area', 'Kitchenette & Microwave', 'Free High-Speed Wi-Fi', 'Complimentary Breakfast', '2 Smart TVs'],
    ARRAY[
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
    ]
),
(
    'Standard Cozy Room',
    'standard-cozy-room',
    'ห้องพักมาตรฐานที่เน้นความสะดวกสบายและคุ้มค่า เตียงนุ่มคุณภาพพรีเมียม เหมาะสำหรับผู้เดินทางเพื่อธุรกิจหรือคู่รักที่ต้องการความเรียบง่าย',
    1500.00,
    2,
    'Queen Bed',
    28,
    8,
    ARRAY['City View', 'Work Desk', 'Free High-Speed Wi-Fi', 'Air Conditioning', 'Private Bathroom', 'Smart TV 40"'],
    ARRAY[
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
    ]
)
ON CONFLICT (slug) DO NOTHING;
