import type { BirthData } from '../engine/types';
import type { Profile } from '../store/db';

export function birthDataFromProfile(profile: Profile): BirthData {
  return {
    name: profile.name,
    date: profile.date,
    time: profile.time,
    lat: profile.lat,
    lng: profile.lng,
    timezone: profile.timezone,
    timeZoneId: profile.timeZoneId,
    city: profile.city,
    country: profile.country,
  };
}
