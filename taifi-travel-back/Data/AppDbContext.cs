using Microsoft.EntityFrameworkCore;
using taifi_travel_back.Models;

namespace taifi_travel_back.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<WorkerAccount> WorkerAccounts { get; set; }
        public DbSet<UserAccount> UserAccounts { get; set; }
        public DbSet<ClientProfile> ClientProfiles { get; set; }
        public DbSet<Trip> Trips { get; set; }
        public DbSet<Hotel> Hotels { get; set; }
        public DbSet<HotelOffer> HotelOffers { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<HajjDetails> HajjDetails { get; set; }
        public DbSet<OmraDetails> OmraDetails { get; set; }
        public DbSet<PaymentLog> PaymentLogs { get; set; }
        public DbSet<HotelPaymentLog> HotelPaymentLogs { get; set; }
        public DbSet<PendingApplication> PendingApplications { get; set; }
        public DbSet<TripHotelOffer> TripHotelOffers { get; set; }
        public DbSet<ContactMessage> ContactMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<WorkerAccount>(entity =>
            {
                entity.HasIndex(e => e.Username).IsUnique();
                entity.Property(e => e.Role).HasDefaultValue("Agent");
            });

            modelBuilder.Entity<ClientProfile>(entity =>
            {
                entity.HasIndex(e => e.CinNumber).IsUnique();
                entity.HasOne(e => e.Account).WithMany().HasForeignKey(e => e.AccountId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.CreatedByWorker).WithMany().HasForeignKey(e => e.CreatedByWorkerId).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Trip>(entity =>
            {
                entity.HasOne(e => e.CreatedByWorker).WithMany().HasForeignKey(e => e.CreatedByWorkerId).OnDelete(DeleteBehavior.SetNull);
                entity.Property(e => e.ImagesBase64).HasColumnType("text[]");
            });


            modelBuilder.Entity<Hotel>(entity =>
            {
                entity.Property(e => e.ImagesBase64).HasColumnType("text[]");
            });

            modelBuilder.Entity<HotelOffer>(entity =>
            {
                entity.Property(e => e.Capacity).HasDefaultValue(4);
                entity.HasOne(e => e.Hotel).WithMany(h => h.HotelOffers).HasForeignKey(e => e.HotelId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Application>(entity =>
            {
                entity.HasOne(e => e.Client).WithMany(c => c.Applications).HasForeignKey(e => e.ClientId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Trip).WithMany(t => t.Applications).HasForeignKey(e => e.TripId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.HotelOffer).WithMany(h => h.Applications).HasForeignKey(e => e.HotelOfferId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(e => e.CreatedByWorker).WithMany().HasForeignKey(e => e.CreatedByWorkerId).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<HajjDetails>(entity =>
            {
                entity.HasKey(e => e.ApplicationId);
                entity.HasOne(e => e.Application).WithOne(a => a.HajjDetails).HasForeignKey<HajjDetails>(e => e.ApplicationId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<OmraDetails>(entity =>
            {
                entity.HasKey(e => e.ApplicationId);
                entity.HasOne(e => e.Application).WithOne(a => a.OmraDetails).HasForeignKey<OmraDetails>(e => e.ApplicationId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PaymentLog>(entity =>
            {
                entity.HasOne(e => e.Client).WithMany(c => c.PaymentLogs).HasForeignKey(e => e.ClientId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Trip).WithMany(t => t.PaymentLogs).HasForeignKey(e => e.TripId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.CreatedByWorker).WithMany().HasForeignKey(e => e.CreatedByWorkerId).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<HotelPaymentLog>(entity =>
            {
                entity.HasOne(e => e.Client).WithMany(c => c.HotelPaymentLogs).HasForeignKey(e => e.ClientId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Trip).WithMany(t => t.HotelPaymentLogs).HasForeignKey(e => e.TripId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.CreatedByWorker).WithMany().HasForeignKey(e => e.CreatedByWorkerId).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<TripHotelOffer>(entity =>
            {
                entity.HasKey(e => new { e.TripId, e.HotelOfferId });
                entity.HasOne(e => e.Trip).WithMany(t => t.TripHotelOffers).HasForeignKey(e => e.TripId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.HotelOffer).WithMany(h => h.TripHotelOffers).HasForeignKey(e => e.HotelOfferId).OnDelete(DeleteBehavior.Cascade);
            });

        }
    }
}
