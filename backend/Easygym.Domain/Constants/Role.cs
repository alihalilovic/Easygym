namespace Easygym.Domain.Constants
{
    public static class Role
    {
        public const string Admin = "admin";
        public const string Trainer = "trainer";
        public const string Client = "client";
        public const string All = $"{Admin}, {Trainer}, {Client}";
        public const string ClientAndTrainer = $"{Client},{Trainer}";
    }
}