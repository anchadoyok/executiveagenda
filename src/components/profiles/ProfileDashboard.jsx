import { CalendarDays, KeyRound, LockKeyhole, Plus, Shield } from 'lucide-react'

export default function ProfileDashboard({
  profiles,
  isAdminUnlocked,
  onEnterProfile,
  onUnlockAdmin,
  onLockAdmin,
  onAddProfile,
  onEditProfile,
  onDeleteProfile,
}) {
  return (
    <div className="landing-shell">
      <section className="landing-hero">
        <div className="landing-hero__copy">
          <p className="eyebrow">Executive Dashboard</p>
          <h1>Executive Agenda</h1>
        </div>

        <div className="hero-actions">
          <button className="button button--primary" type="button" onClick={onAddProfile}>
            <Plus size={18} />
            Tambah Profil
          </button>
          {isAdminUnlocked ? (
            <>
              <button className="button button--ghost" type="button" onClick={onLockAdmin}>
                <LockKeyhole size={18} />
                Kunci Admin
              </button>
            </>
          ) : (
            <button className="button button--ghost" type="button" onClick={onUnlockAdmin}>
              <Shield size={18} />
              Buka Mode Admin
            </button>
          )}
        </div>
      </section>

      <section className="stats-strip">
        <div className="stat-card">
          <CalendarDays size={18} />
          <div>
            <strong>{profiles.length}</strong>
            <span>profil jadwal</span>
          </div>
        </div>
        <div className="stat-card">
          <KeyRound size={18} />
          <div>
            <strong>{isAdminUnlocked ? 'Aktif' : 'Terkunci'}</strong>
            <span>mode admin</span>
          </div>
        </div>
      </section>

      {profiles.length === 0 ? (
        <section className="empty-state">
          <h2>Belum ada jadwal</h2>
          <p>
            Buat profil pertama untuk memisahkan agenda per pejabat, unit, atau
            orang yang kamu atur.
          </p>
          <button className="button button--primary" type="button" onClick={onAddProfile}>
            <Plus size={18} />
            Tambah Profil Pertama
          </button>
        </section>
      ) : (
        <section className="profile-grid">
          {profiles.map((profile) => (
            <article
              key={profile.id}
              className="profile-card"
              style={{ '--accent': profile.accent }}
            >
              <div className="profile-card__top">
                <span className="profile-chip">{profile.settings.defaultTimezone}</span>
                <div className="profile-dot" />
              </div>

              <div>
                <h2>{profile.name}</h2>
                {profile.description ? (
                  <p className="muted-text">{profile.description}</p>
                ) : null}
              </div>

              <div className="profile-metrics">
                <span>{profile.agendas.length} agenda tersimpan</span>
                <span>{profile.settings.showCalendarCounts ? 'indikator aktif' : 'indikator mati'}</span>
              </div>

              <div className="profile-actions">
                <button
                  className="button button--primary"
                  type="button"
                  onClick={() => onEnterProfile(profile)}
                >
                  Buka Jadwal
                </button>
                {isAdminUnlocked ? (
                  <>
                    <button
                      className="button button--ghost"
                      type="button"
                      onClick={() => onEditProfile(profile)}
                    >
                      Edit
                    </button>
                    <button
                      className="button button--danger"
                      type="button"
                      onClick={() => onDeleteProfile(profile)}
                    >
                      Hapus
                    </button>
                  </>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
