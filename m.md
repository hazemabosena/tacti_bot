using System;
using System.IO;
using Data;
using Il2CppDummyDll;

namespace Meta
{
	// Token: 0x02000207 RID: 519
	[Token(Token = "0x2000207")]
	[Serializable]
	public struct Account : ICopiable<Account>
	{
		// Token: 0x06000423 RID: 1059 RVA: 0x00002444 File Offset: 0x00000644
		[Token(Token = "0x6000423")]
		[Address(RVA = "0x8C908EC", Offset = "0x8C8C8EC", VA = "0x8C908EC", Slot = "4")]
		public Account Copy()
		{
			return default(Account);
		}

		// Token: 0x06000424 RID: 1060 RVA: 0x00002066 File Offset: 0x00000266
		[Token(Token = "0x6000424")]
		[Address(RVA = "0x8C888C4", Offset = "0x8C848C4", VA = "0x8C888C4")]
		public void Read(BinaryReader reader)
		{
		}

		// Token: 0x04000698 RID: 1688
		[Token(Token = "0x4000698")]
		[FieldOffset(Offset = "0x0")]
		public string playerId;

		// Token: 0x04000699 RID: 1689
		[Token(Token = "0x4000699")]
		[FieldOffset(Offset = "0x8")]
		public ulong version;

		// Token: 0x0400069A RID: 1690
		[Token(Token = "0x400069A")]
		[FieldOffset(Offset = "0x10")]
		public string name;

		// Token: 0x0400069B RID: 1691
		[Token(Token = "0x400069B")]
		[FieldOffset(Offset = "0x18")]
		public Account.PremiumStatus premiumStatus;

		// Token: 0x0400069C RID: 1692
		[Token(Token = "0x400069C")]
		[FieldOffset(Offset = "0x1C")]
		public uint subscriptionExpireTime;

		// Token: 0x0400069D RID: 1693
		[Token(Token = "0x400069D")]
		[FieldOffset(Offset = "0x20")]
		public long softCurrency;

		// Token: 0x0400069E RID: 1694
		[Token(Token = "0x400069E")]
		[FieldOffset(Offset = "0x28")]
		public long hardCurrency;

		// Token: 0x0400069F RID: 1695
		[Token(Token = "0x400069F")]
		[FieldOffset(Offset = "0x30")]
		public Account.EventSpecialCurrency? eventSpecialCurrency;

		// Token: 0x040006A0 RID: 1696
		[Token(Token = "0x40006A0")]
		[FieldOffset(Offset = "0x48")]
		public Account.EventCurrency? eventCurrency;

		// Token: 0x040006A1 RID: 1697
		[Token(Token = "0x40006A1")]
		[FieldOffset(Offset = "0x78")]
		public Account.CurrencySpendingBonus[] currenciesSpendingBonusData;

		// Token: 0x040006A2 RID: 1698
		[Token(Token = "0x40006A2")]
		[FieldOffset(Offset = "0x80")]
		public uint heroUniversalShards;

		// Token: 0x040006A3 RID: 1699
		[Token(Token = "0x40006A3")]
		[FieldOffset(Offset = "0x84")]
		public uint experience;

		// Token: 0x040006A4 RID: 1700
		[Token(Token = "0x40006A4")]
		[FieldOffset(Offset = "0x88")]
		public uint rating;

		// Token: 0x040006A5 RID: 1701
		[Token(Token = "0x40006A5")]
		[FieldOffset(Offset = "0x8C")]
		public uint level;

		// Token: 0x040006A6 RID: 1702
		[Token(Token = "0x40006A6")]
		[FieldOffset(Offset = "0x90")]
		public ushort maxClaimedRatingReward;

		// Token: 0x040006A7 RID: 1703
		[Token(Token = "0x40006A7")]
		[FieldOffset(Offset = "0x94")]
		public uint secondsUntilPeriodicReward;

		// Token: 0x040006A8 RID: 1704
		[Token(Token = "0x40006A8")]
		[FieldOffset(Offset = "0x98")]
		public uint secondsUntilDailyReward;

		// Token: 0x040006A9 RID: 1705
		[Token(Token = "0x40006A9")]
		[FieldOffset(Offset = "0xA0")]
		public string countryCode;

		// Token: 0x040006AA RID: 1706
		[Token(Token = "0x40006AA")]
		[FieldOffset(Offset = "0xA8")]
		public AvatarId avatarId;

		// Token: 0x040006AB RID: 1707
		[Token(Token = "0x40006AB")]
		[FieldOffset(Offset = "0xAC")]
		public uint matchesCount;

		// Token: 0x040006AC RID: 1708
		[Token(Token = "0x40006AC")]
		[FieldOffset(Offset = "0xB0")]
		public uint zombieMatchesCount;

		// Token: 0x040006AD RID: 1709
		[Token(Token = "0x40006AD")]
		[FieldOffset(Offset = "0xB4")]
		public uint robberyMatchesCount;

		// Token: 0x040006AE RID: 1710
		[Token(Token = "0x40006AE")]
		[FieldOffset(Offset = "0xB8")]
		public uint winsCount;

		// Token: 0x040006AF RID: 1711
		[Token(Token = "0x40006AF")]
		[FieldOffset(Offset = "0xBC")]
		public uint totalMatchTime;

		// Token: 0x040006B0 RID: 1712
		[Token(Token = "0x40006B0")]
		[FieldOffset(Offset = "0xC0")]
		public uint totalKills;

		// Token: 0x040006B1 RID: 1713
		[Token(Token = "0x40006B1")]
		[FieldOffset(Offset = "0xC4")]
		public uint primaryWeaponKills;

		// Token: 0x040006B2 RID: 1714
		[Token(Token = "0x40006B2")]
		[FieldOffset(Offset = "0xC8")]
		public uint secondaryWeaponKills;

		// Token: 0x040006B3 RID: 1715
		[Token(Token = "0x40006B3")]
		[FieldOffset(Offset = "0xCC")]
		public uint explosiveKills;

		// Token: 0x040006B4 RID: 1716
		[Token(Token = "0x40006B4")]
		[FieldOffset(Offset = "0xD0")]
		public uint physicsKills;

		// Token: 0x040006B5 RID: 1717
		[Token(Token = "0x40006B5")]
		[FieldOffset(Offset = "0xD4")]
		public uint meleeKills;

		// Token: 0x040006B6 RID: 1718
		[Token(Token = "0x40006B6")]
		[FieldOffset(Offset = "0xD8")]
		public uint vehicleKills;

		// Token: 0x040006B7 RID: 1719
		[Token(Token = "0x40006B7")]
		[FieldOffset(Offset = "0xDC")]
		public uint assists;

		// Token: 0x040006B8 RID: 1720
		[Token(Token = "0x40006B8")]
		[FieldOffset(Offset = "0xE0")]
		public uint moneySpent;

		// Token: 0x040006B9 RID: 1721
		[Token(Token = "0x40006B9")]
		[FieldOffset(Offset = "0xE4")]
		public uint moneyReceived;

		// Token: 0x040006BA RID: 1722
		[Token(Token = "0x40006BA")]
		[FieldOffset(Offset = "0xE8")]
		public long softCurrencySpent;

		// Token: 0x040006BB RID: 1723
		[Token(Token = "0x40006BB")]
		[FieldOffset(Offset = "0xF0")]
		public long hardCurrencySpent;

		// Token: 0x040006BC RID: 1724
		[Token(Token = "0x40006BC")]
		[FieldOffset(Offset = "0xF8")]
		public uint heroUniversalShardsSpent;

		// Token: 0x040006BD RID: 1725
		[Token(Token = "0x40006BD")]
		[FieldOffset(Offset = "0x100")]
		public long totalSoftCurrency;

		// Token: 0x040006BE RID: 1726
		[Token(Token = "0x40006BE")]
		[FieldOffset(Offset = "0x108")]
		public long totalHardCurrency;

		// Token: 0x040006BF RID: 1727
		[Token(Token = "0x40006BF")]
		[FieldOffset(Offset = "0x110")]
		public uint totalHeroUniversalShards;

		// Token: 0x040006C0 RID: 1728
		[Token(Token = "0x40006C0")]
		[FieldOffset(Offset = "0x114")]
		public uint registrationTime;

		// Token: 0x040006C1 RID: 1729
		[Token(Token = "0x40006C1")]
		[FieldOffset(Offset = "0x118")]
		public ushort accountAgeDays;

		// Token: 0x040006C2 RID: 1730
		[Token(Token = "0x40006C2")]
		[FieldOffset(Offset = "0x11A")]
		public ushort accountActiveDays;

		// Token: 0x040006C3 RID: 1731
		[Token(Token = "0x40006C3")]
		[FieldOffset(Offset = "0x11C")]
		public uint lastLoginTime;

		// Token: 0x040006C4 RID: 1732
		[Token(Token = "0x40006C4")]
		[FieldOffset(Offset = "0x120")]
		public ushort daysSinceLastTimeLogin;

		// Token: 0x040006C5 RID: 1733
		[Token(Token = "0x40006C5")]
		[FieldOffset(Offset = "0x122")]
		public ushort realPurchasesCount;

		// Token: 0x040006C6 RID: 1734
		[Token(Token = "0x40006C6")]
		[FieldOffset(Offset = "0x124")]
		public ushort claimedPeriodicRewards;

		// Token: 0x040006C7 RID: 1735
		[Token(Token = "0x40006C7")]
		[FieldOffset(Offset = "0x126")]
		public ushort claimedVideoAdsRewards;

		// Token: 0x040006C8 RID: 1736
		[Token(Token = "0x40006C8")]
		[FieldOffset(Offset = "0x128")]
		public ushort nameChanges;

		// Token: 0x040006C9 RID: 1737
		[Token(Token = "0x40006C9")]
		[FieldOffset(Offset = "0x12A")]
		public byte changeNamePenalty;

		// Token: 0x040006CA RID: 1738
		[Token(Token = "0x40006CA")]
		[FieldOffset(Offset = "0x12C")]
		public ushort clanParticipationCount;

		// Token: 0x040006CB RID: 1739
		[Token(Token = "0x40006CB")]
		[FieldOffset(Offset = "0x130")]
		public Account.WeaponStats[] weaponStats;

		// Token: 0x040006CC RID: 1740
		[Token(Token = "0x40006CC")]
		[FieldOffset(Offset = "0x138")]
		public Account.Expenses expenses;

		// Token: 0x040006CD RID: 1741
		[Token(Token = "0x40006CD")]
		[FieldOffset(Offset = "0x148")]
		public ushort minWeekMatches;

		// Token: 0x040006CE RID: 1742
		[Token(Token = "0x40006CE")]
		[FieldOffset(Offset = "0x14C")]
		public uint maxHardCurrency;

		// Token: 0x040006CF RID: 1743
		[Token(Token = "0x40006CF")]
		[FieldOffset(Offset = "0x150")]
		public uint nextMatchResultAdsTime;

		// Token: 0x040006D0 RID: 1744
		[Token(Token = "0x40006D0")]
		[FieldOffset(Offset = "0x154")]
		public bool instantRewardAvailable;

		// Token: 0x040006D1 RID: 1745
		[Token(Token = "0x40006D1")]
		[FieldOffset(Offset = "0x155")]
		public bool instantRewardIsDoubled;

		// Token: 0x040006D2 RID: 1746
		[Token(Token = "0x40006D2")]
		[FieldOffset(Offset = "0x156")]
		public bool heroShardsMatchIsPlayed;

		// Token: 0x040006D3 RID: 1747
		[Token(Token = "0x40006D3")]
		[FieldOffset(Offset = "0x157")]
		public byte countHeroShardsAdsViewed;

		// Token: 0x040006D4 RID: 1748
		[Token(Token = "0x40006D4")]
		[FieldOffset(Offset = "0x158")]
		public uint secondsUntilHeroShardsReward;

		// Token: 0x040006D5 RID: 1749
		[Token(Token = "0x40006D5")]
		[FieldOffset(Offset = "0x15C")]
		public uint secondsUntilRandomAdsKitReward;

		// Token: 0x040006D6 RID: 1750
		[Token(Token = "0x40006D6")]
		[FieldOffset(Offset = "0x160")]
		public byte randomAdsKitCounter;

		// Token: 0x040006D7 RID: 1751
		[Token(Token = "0x40006D7")]
		[FieldOffset(Offset = "0x168")]
		public Account.ZombieModeEvent? zombieModeEvent;

		// Token: 0x040006D8 RID: 1752
		[Token(Token = "0x40006D8")]
		[FieldOffset(Offset = "0x1B0")]
		public Account.ZombieMode[] zombieModes;

		// Token: 0x040006D9 RID: 1753
		[Token(Token = "0x40006D9")]
		[FieldOffset(Offset = "0x1B8")]
		public Account.FootballMode? footballMode;

		// Token: 0x040006DA RID: 1754
		[Token(Token = "0x40006DA")]
		[FieldOffset(Offset = "0x1D8")]
		public Account.BattleRoyaleEvent? battleRoyaleEvent;

		// Token: 0x040006DB RID: 1755
		[Token(Token = "0x40006DB")]
		[FieldOffset(Offset = "0x1F8")]
		public Account.RobberyModeEvent? robberyModeEvent;

		// Token: 0x040006DC RID: 1756
		[Token(Token = "0x40006DC")]
		[FieldOffset(Offset = "0x230")]
		public Account.Weapon[] primaryWeapons;

		// Token: 0x040006DD RID: 1757
		[Token(Token = "0x40006DD")]
		[FieldOffset(Offset = "0x238")]
		public Account.Weapon[] secondaryWeapons;

		// Token: 0x040006DE RID: 1758
		[Token(Token = "0x40006DE")]
		[FieldOffset(Offset = "0x240")]
		public Account.WeaponSkin[] weaponSkins;

		// Token: 0x040006DF RID: 1759
		[Token(Token = "0x40006DF")]
		[FieldOffset(Offset = "0x248")]
		public Account.Intel[] intels;

		// Token: 0x040006E0 RID: 1760
		[Token(Token = "0x40006E0")]
		[FieldOffset(Offset = "0x250")]
		public Account.Ability[] abilities;

		// Token: 0x040006E1 RID: 1761
		[Token(Token = "0x40006E1")]
		[FieldOffset(Offset = "0x258")]
		public SpawnConsumable[] spawnConsumables;

		// Token: 0x040006E2 RID: 1762
		[Token(Token = "0x40006E2")]
		[FieldOffset(Offset = "0x260")]
		public Trinket[] trinkets;

		// Token: 0x040006E3 RID: 1763
		[Token(Token = "0x40006E3")]
		[FieldOffset(Offset = "0x268")]
		public TrinketChip[] trinketChips;

		// Token: 0x040006E4 RID: 1764
		[Token(Token = "0x40006E4")]
		[FieldOffset(Offset = "0x270")]
		public Account.Emotion[] emotions;

		// Token: 0x040006E5 RID: 1765
		[Token(Token = "0x40006E5")]
		[FieldOffset(Offset = "0x278")]
		public ushort[] equippedEmotions;

		// Token: 0x040006E6 RID: 1766
		[Token(Token = "0x40006E6")]
		[FieldOffset(Offset = "0x280")]
		public Account.Hero[] heroes;

		// Token: 0x040006E7 RID: 1767
		[Token(Token = "0x40006E7")]
		[FieldOffset(Offset = "0x288")]
		public Account.FreeHeroCount[] freeHeroCounts;

		// Token: 0x040006E8 RID: 1768
		[Token(Token = "0x40006E8")]
		[FieldOffset(Offset = "0x290")]
		public ShardedItem[] heroSkins;

		// Token: 0x040006E9 RID: 1769
		[Token(Token = "0x40006E9")]
		[FieldOffset(Offset = "0x298")]
		public Account.Hat[] hats;

		// Token: 0x040006EA RID: 1770
		[Token(Token = "0x40006EA")]
		[FieldOffset(Offset = "0x2A0")]
		public AccountPresetInfo presetInfo;

		// Token: 0x040006EB RID: 1771
		[Token(Token = "0x40006EB")]
		[FieldOffset(Offset = "0x2B0")]
		public AccountPresetInfo? newYearPresetInfo;

		// Token: 0x040006EC RID: 1772
		[Token(Token = "0x40006EC")]
		[FieldOffset(Offset = "0x2C8")]
		public ushort availablePresetSlotsCount;

		// Token: 0x040006ED RID: 1773
		[Token(Token = "0x40006ED")]
		[FieldOffset(Offset = "0x2CA")]
		public ushort availableTrinketSlotsCount;

		// Token: 0x040006EE RID: 1774
		[Token(Token = "0x40006EE")]
		[FieldOffset(Offset = "0x2D0")]
		public ShardedItem[] avatars;

		// Token: 0x040006EF RID: 1775
		[Token(Token = "0x40006EF")]
		[FieldOffset(Offset = "0x2D8")]
		public Account.AvatarFrame[] avatarFrames;

		// Token: 0x040006F0 RID: 1776
		[Token(Token = "0x40006F0")]
		[FieldOffset(Offset = "0x2E0")]
		public Account.ProductPlacement[] productPlacements;

		// Token: 0x040006F1 RID: 1777
		[Token(Token = "0x40006F1")]
		[FieldOffset(Offset = "0x2E8")]
		public Account.CustomKit[] purchasedCustomKits;

		// Token: 0x040006F2 RID: 1778
		[Token(Token = "0x40006F2")]
		[FieldOffset(Offset = "0x2F0")]
		public Offer[] offers;

		// Token: 0x040006F3 RID: 1779
		[Token(Token = "0x40006F3")]
		[FieldOffset(Offset = "0x2F8")]
		public Account.Patch[] patches;

		// Token: 0x040006F4 RID: 1780
		[Token(Token = "0x40006F4")]
		[FieldOffset(Offset = "0x300")]
		public QuestInfo questInfo;

		// Token: 0x040006F5 RID: 1781
		[Token(Token = "0x40006F5")]
		[FieldOffset(Offset = "0x310")]
		public string[] manualPriorityRegions;

		// Token: 0x040006F6 RID: 1782
		[Token(Token = "0x40006F6")]
		[FieldOffset(Offset = "0x318")]
		public Account.Event[] events;

		// Token: 0x040006F7 RID: 1783
		[Token(Token = "0x40006F7")]
		[FieldOffset(Offset = "0x320")]
		public Account.VipShop[] vipShops;

		// Token: 0x040006F8 RID: 1784
		[Token(Token = "0x40006F8")]
		[FieldOffset(Offset = "0x328")]
		public Account.RewardPass[] rewardPasses;

		// Token: 0x040006F9 RID: 1785
		[Token(Token = "0x40006F9")]
		[FieldOffset(Offset = "0x330")]
		public Account.ProgressiveKit[] progressiveKits;

		// Token: 0x040006FA RID: 1786
		[Token(Token = "0x40006FA")]
		[FieldOffset(Offset = "0x338")]
		public Account.RateMe rateMe;

		// Token: 0x040006FB RID: 1787
		[Token(Token = "0x40006FB")]
		[FieldOffset(Offset = "0x340")]
		public Account.ScheduleEntry[] scheduleEntries;

		// Token: 0x040006FC RID: 1788
		[Token(Token = "0x40006FC")]
		[FieldOffset(Offset = "0x348")]
		public Account.GameplayEventData[] gameplayEventData;

		// Token: 0x040006FD RID: 1789
		[Token(Token = "0x40006FD")]
		[FieldOffset(Offset = "0x350")]
		public Account.Marathon[] activeMarathons;

		// Token: 0x040006FE RID: 1790
		[Token(Token = "0x40006FE")]
		[FieldOffset(Offset = "0x358")]
		public Account.PiggyBank? activePiggyBank;

		// Token: 0x040006FF RID: 1791
		[Token(Token = "0x40006FF")]
		[FieldOffset(Offset = "0x368")]
		public bool emailRegistered;

		// Token: 0x04000700 RID: 1792
		[Token(Token = "0x4000700")]
		[FieldOffset(Offset = "0x370")]
		public Account.GachaKit[] gachaKits;

		// Token: 0x04000701 RID: 1793
		[Token(Token = "0x4000701")]
		[FieldOffset(Offset = "0x378")]
		public Account.GachaToken[] gachaTokens;

		// Token: 0x04000702 RID: 1794
		[Token(Token = "0x4000702")]
		[FieldOffset(Offset = "0x380")]
		public Account.RewardSquare? rewardSquare;

		// Token: 0x04000703 RID: 1795
		[Token(Token = "0x4000703")]
		[FieldOffset(Offset = "0x398")]
		public Account.GoodsSet[] goodsSets;

		// Token: 0x04000704 RID: 1796
		[Token(Token = "0x4000704")]
		[FieldOffset(Offset = "0x3A0")]
		public ulong? deletesAt;

		// Token: 0x04000705 RID: 1797
		[Token(Token = "0x4000705")]
		[FieldOffset(Offset = "0x3B0")]
		public ulong clientFlags;

		// Token: 0x04000706 RID: 1798
		[Token(Token = "0x4000706")]
		[FieldOffset(Offset = "0x3B8")]
		public bool testAccount;

		// Token: 0x04000707 RID: 1799
		[Token(Token = "0x4000707")]
		[FieldOffset(Offset = "0x3C0")]
		public Account.CommunityGoalInfo[] takenCommunityGoals;

		// Token: 0x04000708 RID: 1800
		[Token(Token = "0x4000708")]
		[FieldOffset(Offset = "0x3C8")]
		public Account.BanInfo[] banInfo;

		// Token: 0x04000709 RID: 1801
		[Token(Token = "0x4000709")]
		[FieldOffset(Offset = "0x3D0")]
		public Account.CollectibleWeaponCompensationTokenInfo[] collectibleWeaponCompensationTokenInfo;

		// Token: 0x0400070A RID: 1802
		[Token(Token = "0x400070A")]
		[FieldOffset(Offset = "0x3D8")]
		public HeroFactionBonus heroFactionBonus;

		// Token: 0x0400070B RID: 1803
		[Token(Token = "0x400070B")]
		[FieldOffset(Offset = "0x3E0")]
		public WeaponUpgradeTokenInfo[] weaponUpgradeTokensInfo;

		// Token: 0x0400070C RID: 1804
		[Token(Token = "0x400070C")]
		[FieldOffset(Offset = "0x3E8")]
		public bool myGamesAccountLinked;

		// Token: 0x02000208 RID: 520
		[Token(Token = "0x2000208")]
		public enum PremiumStatus : byte
		{
			// Token: 0x0400070E RID: 1806
			[Token(Token = "0x400070E")]
			None,
			// Token: 0x0400070F RID: 1807
			[Token(Token = "0x400070F")]
			Active,
			// Token: 0x04000710 RID: 1808
			[Token(Token = "0x4000710")]
			Expired,
			// Token: 0x04000711 RID: 1809
			[Token(Token = "0x4000711")]
			Held
		}

		// Token: 0x02000209 RID: 521
		[Token(Token = "0x2000209")]
		public enum BanReason : byte
		{
			// Token: 0x04000713 RID: 1811
			[Token(Token = "0x4000713")]
			None,
			// Token: 0x04000714 RID: 1812
			[Token(Token = "0x4000714")]
			ToxicBehavior,
			// Token: 0x04000715 RID: 1813
			[Token(Token = "0x4000715")]
			Inactivity,
			// Token: 0x04000716 RID: 1814
			[Token(Token = "0x4000716")]
			Cheating
		}

		// Token: 0x0200020A RID: 522
		[Token(Token = "0x200020A")]
		[Serializable]
		public struct WeaponStats : ICopiable<Account.WeaponStats>
		{
			// Token: 0x06000425 RID: 1061 RVA: 0x0000245C File Offset: 0x0000065C
			[Token(Token = "0x6000425")]
			[Address(RVA = "0x8C92E14", Offset = "0x8C8EE14", VA = "0x8C92E14", Slot = "4")]
			public Account.WeaponStats Copy()
			{
				return default(Account.WeaponStats);
			}

			// Token: 0x06000426 RID: 1062 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000426")]
			[Address(RVA = "0x8C942E8", Offset = "0x8C902E8", VA = "0x8C942E8")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000717 RID: 1815
			[Token(Token = "0x4000717")]
			[FieldOffset(Offset = "0x0")]
			public WeaponClass weaponClass;

			// Token: 0x04000718 RID: 1816
			[Token(Token = "0x4000718")]
			[FieldOffset(Offset = "0x4")]
			public uint oldKills;

			// Token: 0x04000719 RID: 1817
			[Token(Token = "0x4000719")]
			[FieldOffset(Offset = "0x8")]
			public uint kills;

			// Token: 0x0400071A RID: 1818
			[Token(Token = "0x400071A")]
			[FieldOffset(Offset = "0xC")]
			public uint deaths;
		}

		// Token: 0x0200020B RID: 523
		[Token(Token = "0x200020B")]
		[Serializable]
		public struct ZombiePassInfo : ICopiable<Account.ZombiePassInfo>
		{
			// Token: 0x06000427 RID: 1063 RVA: 0x00002474 File Offset: 0x00000674
			[Token(Token = "0x6000427")]
			[Address(RVA = "0x8C959E0", Offset = "0x8C919E0", VA = "0x8C959E0", Slot = "4")]
			public Account.ZombiePassInfo Copy()
			{
				return default(Account.ZombiePassInfo);
			}

			// Token: 0x06000428 RID: 1064 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000428")]
			[Address(RVA = "0x8C959FC", Offset = "0x8C919FC", VA = "0x8C959FC")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400071B RID: 1819
			[Token(Token = "0x400071B")]
			[FieldOffset(Offset = "0x0")]
			public uint secondsUntilFreePass;

			// Token: 0x0400071C RID: 1820
			[Token(Token = "0x400071C")]
			[FieldOffset(Offset = "0x4")]
			public bool passAdAvailable;

			// Token: 0x0400071D RID: 1821
			[Token(Token = "0x400071D")]
			[FieldOffset(Offset = "0x5")]
			public byte passes;
		}

		// Token: 0x0200020C RID: 524
		[Token(Token = "0x200020C")]
		[Serializable]
		public struct ZombieModeEvent : ICopiable<Account.ZombieModeEvent>
		{
			// Token: 0x06000429 RID: 1065 RVA: 0x0000248C File Offset: 0x0000068C
			[Token(Token = "0x6000429")]
			[Address(RVA = "0x8C92EC4", Offset = "0x8C8EEC4", VA = "0x8C92EC4", Slot = "4")]
			public Account.ZombieModeEvent Copy()
			{
				return default(Account.ZombieModeEvent);
			}

			// Token: 0x0600042A RID: 1066 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x600042A")]
			[Address(RVA = "0x8C9442C", Offset = "0x8C9042C", VA = "0x8C9442C")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400071E RID: 1822
			[Token(Token = "0x400071E")]
			[FieldOffset(Offset = "0x0")]
			public ZombieModeEventId id;

			// Token: 0x0400071F RID: 1823
			[Token(Token = "0x400071F")]
			[FieldOffset(Offset = "0x8")]
			public ZombieModeBoostId[] boostIds;

			// Token: 0x04000720 RID: 1824
			[Token(Token = "0x4000720")]
			[FieldOffset(Offset = "0x10")]
			public AccountPresetInfo? presetInfo;

			// Token: 0x04000721 RID: 1825
			[Token(Token = "0x4000721")]
			[FieldOffset(Offset = "0x28")]
			public Account.ZombieModeEvent.ZombieModeLaboratory? zombieModeLaboratory;

			// Token: 0x04000722 RID: 1826
			[Token(Token = "0x4000722")]
			[FieldOffset(Offset = "0x38")]
			public ushort? mutatorId;

			// Token: 0x0200020D RID: 525
			[Token(Token = "0x200020D")]
			[Serializable]
			public struct ZombieModeLaboratory : ICopiable<Account.ZombieModeEvent.ZombieModeLaboratory>
			{
				// Token: 0x0600042B RID: 1067 RVA: 0x000024A4 File Offset: 0x000006A4
				[Token(Token = "0x600042B")]
				[Address(RVA = "0x8C95A64", Offset = "0x8C91A64", VA = "0x8C95A64", Slot = "4")]
				public Account.ZombieModeEvent.ZombieModeLaboratory Copy()
				{
					return default(Account.ZombieModeEvent.ZombieModeLaboratory);
				}

				// Token: 0x0600042C RID: 1068 RVA: 0x00002066 File Offset: 0x00000266
				[Token(Token = "0x600042C")]
				[Address(RVA = "0x8C95B20", Offset = "0x8C91B20", VA = "0x8C95B20")]
				public void Read(BinaryReader reader)
				{
				}

				// Token: 0x04000723 RID: 1827
				[Token(Token = "0x4000723")]
				[FieldOffset(Offset = "0x0")]
				public ZombieModeBoostId[] boostIds;
			}
		}

		// Token: 0x0200020E RID: 526
		[Token(Token = "0x200020E")]
		[Serializable]
		public struct ZombieMode : ICopiable<Account.ZombieMode>
		{
			// Token: 0x0600042D RID: 1069 RVA: 0x000024BC File Offset: 0x000006BC
			[Token(Token = "0x600042D")]
			[Address(RVA = "0x8C93130", Offset = "0x8C8F130", VA = "0x8C93130", Slot = "4")]
			public Account.ZombieMode Copy()
			{
				return default(Account.ZombieMode);
			}

			// Token: 0x0600042E RID: 1070 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x600042E")]
			[Address(RVA = "0x8C94630", Offset = "0x8C90630", VA = "0x8C94630")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000724 RID: 1828
			[Token(Token = "0x4000724")]
			[FieldOffset(Offset = "0x0")]
			public ZombieModeId id;

			// Token: 0x04000725 RID: 1829
			[Token(Token = "0x4000725")]
			[FieldOffset(Offset = "0x4")]
			public byte maxCompletedWaves;

			// Token: 0x04000726 RID: 1830
			[Token(Token = "0x4000726")]
			[FieldOffset(Offset = "0x8")]
			public uint secondsUntilRewardsUpdate;

			// Token: 0x04000727 RID: 1831
			[Token(Token = "0x4000727")]
			[FieldOffset(Offset = "0xC")]
			public Account.ZombiePassInfo? zombiePassInfo;
		}

		// Token: 0x0200020F RID: 527
		[Token(Token = "0x200020F")]
		[Serializable]
		public struct FootballMode : ICopiable<Account.FootballMode>
		{
			// Token: 0x0600042F RID: 1071 RVA: 0x000024D4 File Offset: 0x000006D4
			[Token(Token = "0x600042F")]
			[Address(RVA = "0x8C93234", Offset = "0x8C8F234", VA = "0x8C93234", Slot = "4")]
			public Account.FootballMode Copy()
			{
				return default(Account.FootballMode);
			}

			// Token: 0x06000430 RID: 1072 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000430")]
			[Address(RVA = "0x8C94718", Offset = "0x8C90718", VA = "0x8C94718")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000728 RID: 1832
			[Token(Token = "0x4000728")]
			[FieldOffset(Offset = "0x0")]
			public FootballModeId id;

			// Token: 0x04000729 RID: 1833
			[Token(Token = "0x4000729")]
			[FieldOffset(Offset = "0x8")]
			public AccountPresetInfo presetInfo;
		}

		// Token: 0x02000210 RID: 528
		[Token(Token = "0x2000210")]
		[Serializable]
		public struct BattleRoyaleEvent : ICopiable<Account.BattleRoyaleEvent>
		{
			// Token: 0x06000431 RID: 1073 RVA: 0x000024EC File Offset: 0x000006EC
			[Token(Token = "0x6000431")]
			[Address(RVA = "0x8C9325C", Offset = "0x8C8F25C", VA = "0x8C9325C", Slot = "4")]
			public Account.BattleRoyaleEvent Copy()
			{
				return default(Account.BattleRoyaleEvent);
			}

			// Token: 0x06000432 RID: 1074 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000432")]
			[Address(RVA = "0x8C94744", Offset = "0x8C90744", VA = "0x8C94744")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400072A RID: 1834
			[Token(Token = "0x400072A")]
			[FieldOffset(Offset = "0x0")]
			public BattleRoyaleDataId id;

			// Token: 0x0400072B RID: 1835
			[Token(Token = "0x400072B")]
			[FieldOffset(Offset = "0x8")]
			public AccountPresetInfo presetInfo;
		}

		// Token: 0x02000211 RID: 529
		[Token(Token = "0x2000211")]
		[Serializable]
		public struct RobberyModeEvent : ICopiable<Account.RobberyModeEvent>
		{
			// Token: 0x06000433 RID: 1075 RVA: 0x00002504 File Offset: 0x00000704
			[Token(Token = "0x6000433")]
			[Address(RVA = "0x8C93284", Offset = "0x8C8F284", VA = "0x8C93284", Slot = "4")]
			public Account.RobberyModeEvent Copy()
			{
				return default(Account.RobberyModeEvent);
			}

			// Token: 0x06000434 RID: 1076 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000434")]
			[Address(RVA = "0x8C94770", Offset = "0x8C90770", VA = "0x8C94770")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400072C RID: 1836
			[Token(Token = "0x400072C")]
			[FieldOffset(Offset = "0x0")]
			public RobberyModeEventId id;

			// Token: 0x0400072D RID: 1837
			[Token(Token = "0x400072D")]
			[FieldOffset(Offset = "0x8")]
			public AccountPresetInfo presetInfo;

			// Token: 0x0400072E RID: 1838
			[Token(Token = "0x400072E")]
			[FieldOffset(Offset = "0x18")]
			public byte[] hideoutRowsProgress;

			// Token: 0x0400072F RID: 1839
			[Token(Token = "0x400072F")]
			[FieldOffset(Offset = "0x20")]
			public Account.RobberyModeEvent.LaunderingData launderingData;

			// Token: 0x02000212 RID: 530
			[Token(Token = "0x2000212")]
			[Serializable]
			public struct LaunderingData : ICopiable<Account.RobberyModeEvent.LaunderingData>
			{
				// Token: 0x06000435 RID: 1077 RVA: 0x0000251C File Offset: 0x0000071C
				[Token(Token = "0x6000435")]
				[Address(RVA = "0x8C95BE0", Offset = "0x8C91BE0", VA = "0x8C95BE0", Slot = "4")]
				public Account.RobberyModeEvent.LaunderingData Copy()
				{
					return default(Account.RobberyModeEvent.LaunderingData);
				}

				// Token: 0x06000436 RID: 1078 RVA: 0x00002066 File Offset: 0x00000266
				[Token(Token = "0x6000436")]
				[Address(RVA = "0x8C95BF8", Offset = "0x8C91BF8", VA = "0x8C95BF8")]
				public void Read(BinaryReader reader)
				{
				}

				// Token: 0x04000730 RID: 1840
				[Token(Token = "0x4000730")]
				[FieldOffset(Offset = "0x0")]
				public uint nextResetTs;

				// Token: 0x04000731 RID: 1841
				[Token(Token = "0x4000731")]
				[FieldOffset(Offset = "0x4")]
				public byte watchedAdsCount;

				// Token: 0x04000732 RID: 1842
				[Token(Token = "0x4000732")]
				[FieldOffset(Offset = "0x8")]
				public uint currentPoints;
			}
		}

		// Token: 0x02000213 RID: 531
		[Token(Token = "0x2000213")]
		[Serializable]
		public struct Weapon : ICopiable<Account.Weapon>
		{
			// Token: 0x06000437 RID: 1079 RVA: 0x00002534 File Offset: 0x00000734
			[Token(Token = "0x6000437")]
			[Address(RVA = "0x8C93388", Offset = "0x8C8F388", VA = "0x8C93388", Slot = "4")]
			public Account.Weapon Copy()
			{
				return default(Account.Weapon);
			}

			// Token: 0x06000438 RID: 1080 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000438")]
			[Address(RVA = "0x8C94858", Offset = "0x8C90858", VA = "0x8C94858")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000733 RID: 1843
			[Token(Token = "0x4000733")]
			[FieldOffset(Offset = "0x0")]
			public WeaponId id;

			// Token: 0x04000734 RID: 1844
			[Token(Token = "0x4000734")]
			[FieldOffset(Offset = "0x4")]
			public byte level;

			// Token: 0x04000735 RID: 1845
			[Token(Token = "0x4000735")]
			[FieldOffset(Offset = "0x8")]
			public WeaponSkinId skinId;

			// Token: 0x04000736 RID: 1846
			[Token(Token = "0x4000736")]
			[FieldOffset(Offset = "0xC")]
			public ushort shards;

			// Token: 0x04000737 RID: 1847
			[Token(Token = "0x4000737")]
			[FieldOffset(Offset = "0x10")]
			public ModuleId[] moduleIds;

			// Token: 0x04000738 RID: 1848
			[Token(Token = "0x4000738")]
			[FieldOffset(Offset = "0x18")]
			public ModuleId[] mountedModuleIds;
		}

		// Token: 0x02000214 RID: 532
		[Token(Token = "0x2000214")]
		[Serializable]
		public struct WeaponSkin : ICopiable<Account.WeaponSkin>
		{
			// Token: 0x06000439 RID: 1081 RVA: 0x0000254C File Offset: 0x0000074C
			[Token(Token = "0x6000439")]
			[Address(RVA = "0x8C93520", Offset = "0x8C8F520", VA = "0x8C93520", Slot = "4")]
			public Account.WeaponSkin Copy()
			{
				return default(Account.WeaponSkin);
			}

			// Token: 0x0600043A RID: 1082 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x600043A")]
			[Address(RVA = "0x8C949CC", Offset = "0x8C909CC", VA = "0x8C949CC")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000739 RID: 1849
			[Token(Token = "0x4000739")]
			[FieldOffset(Offset = "0x0")]
			public WeaponClass weaponClass;

			// Token: 0x0400073A RID: 1850
			[Token(Token = "0x400073A")]
			[FieldOffset(Offset = "0x4")]
			public ShardedItem skinData;
		}

		// Token: 0x02000215 RID: 533
		[Token(Token = "0x2000215")]
		[Serializable]
		public struct Intel : ICopiable<Account.Intel>
		{
			// Token: 0x0600043B RID: 1083 RVA: 0x00002564 File Offset: 0x00000764
			[Token(Token = "0x600043B")]
			[Address(RVA = "0x8C93540", Offset = "0x8C8F540", VA = "0x8C93540", Slot = "4")]
			public Account.Intel Copy()
			{
				return default(Account.Intel);
			}

			// Token: 0x0600043C RID: 1084 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x600043C")]
			[Address(RVA = "0x8C949FC", Offset = "0x8C909FC", VA = "0x8C949FC")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400073B RID: 1851
			[Token(Token = "0x400073B")]
			[FieldOffset(Offset = "0x0")]
			public ItemRarity rarity;

			// Token: 0x0400073C RID: 1852
			[Token(Token = "0x400073C")]
			[FieldOffset(Offset = "0x4")]
			public uint amount;
		}

		// Token: 0x02000216 RID: 534
		[Token(Token = "0x2000216")]
		[Serializable]
		public struct Ability : ICopiable<Account.Ability>
		{
			// Token: 0x0600043D RID: 1085 RVA: 0x0000257C File Offset: 0x0000077C
			[Token(Token = "0x600043D")]
			[Address(RVA = "0x8C93554", Offset = "0x8C8F554", VA = "0x8C93554", Slot = "4")]
			public Account.Ability Copy()
			{
				return default(Account.Ability);
			}

			// Token: 0x0600043E RID: 1086 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x600043E")]
			[Address(RVA = "0x8C94A4C", Offset = "0x8C90A4C", VA = "0x8C94A4C")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400073D RID: 1853
			[Token(Token = "0x400073D")]
			[FieldOffset(Offset = "0x0")]
			public AbilityId id;

			// Token: 0x0400073E RID: 1854
			[Token(Token = "0x400073E")]
			[FieldOffset(Offset = "0x4")]
			public bool isUnlocked;

			// Token: 0x0400073F RID: 1855
			[Token(Token = "0x400073F")]
			[FieldOffset(Offset = "0x8")]
			public Account.Ability.Upgrade[] upgrades;

			// Token: 0x04000740 RID: 1856
			[Token(Token = "0x4000740")]
			[FieldOffset(Offset = "0x10")]
			public bool timeoutFound;

			// Token: 0x04000741 RID: 1857
			[Token(Token = "0x4000741")]
			[FieldOffset(Offset = "0x14")]
			public uint timeout;

			// Token: 0x02000217 RID: 535
			[Token(Token = "0x2000217")]
			[Serializable]
			public struct Upgrade : ICopiable<Account.Ability.Upgrade>
			{
				// Token: 0x0600043F RID: 1087 RVA: 0x00002594 File Offset: 0x00000794
				[Token(Token = "0x600043F")]
				[Address(RVA = "0x8C95C60", Offset = "0x8C91C60", VA = "0x8C95C60", Slot = "4")]
				public Account.Ability.Upgrade Copy()
				{
					return default(Account.Ability.Upgrade);
				}

				// Token: 0x06000440 RID: 1088 RVA: 0x00002066 File Offset: 0x00000266
				[Token(Token = "0x6000440")]
				[Address(RVA = "0x8C95C68", Offset = "0x8C91C68", VA = "0x8C95C68")]
				public void Read(BinaryReader reader)
				{
				}

				// Token: 0x04000742 RID: 1858
				[Token(Token = "0x4000742")]
				[FieldOffset(Offset = "0x0")]
				public byte id;

				// Token: 0x04000743 RID: 1859
				[Token(Token = "0x4000743")]
				[FieldOffset(Offset = "0x1")]
				public byte level;
			}
		}

		// Token: 0x02000218 RID: 536
		[Token(Token = "0x2000218")]
		[Serializable]
		public struct Emotion : ICopiable<Account.Emotion>
		{
			// Token: 0x06000441 RID: 1089 RVA: 0x000025AC File Offset: 0x000007AC
			[Token(Token = "0x6000441")]
			[Address(RVA = "0x8C9366C", Offset = "0x8C8F66C", VA = "0x8C9366C", Slot = "4")]
			public Account.Emotion Copy()
			{
				return default(Account.Emotion);
			}

			// Token: 0x06000442 RID: 1090 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000442")]
			[Address(RVA = "0x8C94B68", Offset = "0x8C90B68", VA = "0x8C94B68")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000744 RID: 1860
			[Token(Token = "0x4000744")]
			[FieldOffset(Offset = "0x0")]
			public HeroEmotionId id;
		}

		// Token: 0x02000219 RID: 537
		[Token(Token = "0x2000219")]
		[Serializable]
		public struct Hero : ICopiable<Account.Hero>
		{
			// Token: 0x06000443 RID: 1091 RVA: 0x000025C4 File Offset: 0x000007C4
			[Token(Token = "0x6000443")]
			[Address(RVA = "0x8C93674", Offset = "0x8C8F674", VA = "0x8C93674", Slot = "4")]
			public Account.Hero Copy()
			{
				return default(Account.Hero);
			}

			// Token: 0x06000444 RID: 1092 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000444")]
			[Address(RVA = "0x8C94B70", Offset = "0x8C90B70", VA = "0x8C94B70")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000745 RID: 1861
			[Token(Token = "0x4000745")]
			[FieldOffset(Offset = "0x0")]
			public HeroId id;

			// Token: 0x04000746 RID: 1862
			[Token(Token = "0x4000746")]
			[FieldOffset(Offset = "0x4")]
			public ushort shards;

			// Token: 0x04000747 RID: 1863
			[Token(Token = "0x4000747")]
			[FieldOffset(Offset = "0x6")]
			public byte level;

			// Token: 0x04000748 RID: 1864
			[Token(Token = "0x4000748")]
			[FieldOffset(Offset = "0x8")]
			public byte[] talents;

			// Token: 0x04000749 RID: 1865
			[Token(Token = "0x4000749")]
			[FieldOffset(Offset = "0x10")]
			public HeroSkinId skinId;

			// Token: 0x0400074A RID: 1866
			[Token(Token = "0x400074A")]
			[FieldOffset(Offset = "0x14")]
			public HatId hatId;

			// Token: 0x0400074B RID: 1867
			[Token(Token = "0x400074B")]
			[FieldOffset(Offset = "0x18")]
			public ushort missionId;
		}

		// Token: 0x0200021A RID: 538
		[Token(Token = "0x200021A")]
		[Serializable]
		public struct FreeHeroCount : ICopiable<Account.FreeHeroCount>
		{
			// Token: 0x06000445 RID: 1093 RVA: 0x000025DC File Offset: 0x000007DC
			[Token(Token = "0x6000445")]
			[Address(RVA = "0x8C9378C", Offset = "0x8C8F78C", VA = "0x8C9378C", Slot = "4")]
			public Account.FreeHeroCount Copy()
			{
				return default(Account.FreeHeroCount);
			}

			// Token: 0x06000446 RID: 1094 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000446")]
			[Address(RVA = "0x8C94CA0", Offset = "0x8C90CA0", VA = "0x8C94CA0")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400074C RID: 1868
			[Token(Token = "0x400074C")]
			[FieldOffset(Offset = "0x0")]
			public ItemRarity rarity;

			// Token: 0x0400074D RID: 1869
			[Token(Token = "0x400074D")]
			[FieldOffset(Offset = "0x1")]
			public byte count;
		}

		// Token: 0x0200021B RID: 539
		[Token(Token = "0x200021B")]
		[Serializable]
		public struct Hat : ICopiable<Account.Hat>
		{
			// Token: 0x06000447 RID: 1095 RVA: 0x000025F4 File Offset: 0x000007F4
			[Token(Token = "0x6000447")]
			[Address(RVA = "0x8C93794", Offset = "0x8C8F794", VA = "0x8C93794", Slot = "4")]
			public Account.Hat Copy()
			{
				return default(Account.Hat);
			}

			// Token: 0x06000448 RID: 1096 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000448")]
			[Address(RVA = "0x8C94CEC", Offset = "0x8C90CEC", VA = "0x8C94CEC")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400074E RID: 1870
			[Token(Token = "0x400074E")]
			[FieldOffset(Offset = "0x0")]
			public HatId id;

			// Token: 0x0400074F RID: 1871
			[Token(Token = "0x400074F")]
			[FieldOffset(Offset = "0x4")]
			public bool timeoutFound;

			// Token: 0x04000750 RID: 1872
			[Token(Token = "0x4000750")]
			[FieldOffset(Offset = "0x8")]
			public uint secondsUntilExpiredHat;
		}

		// Token: 0x0200021C RID: 540
		[Token(Token = "0x200021C")]
		[Serializable]
		public struct AvatarFrame : ICopiable<Account.AvatarFrame>
		{
			// Token: 0x06000449 RID: 1097 RVA: 0x0000260C File Offset: 0x0000080C
			[Token(Token = "0x6000449")]
			[Address(RVA = "0x8C9388C", Offset = "0x8C8F88C", VA = "0x8C9388C", Slot = "4")]
			public Account.AvatarFrame Copy()
			{
				return default(Account.AvatarFrame);
			}

			// Token: 0x0600044A RID: 1098 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x600044A")]
			[Address(RVA = "0x8C94E14", Offset = "0x8C90E14", VA = "0x8C94E14")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000751 RID: 1873
			[Token(Token = "0x4000751")]
			[FieldOffset(Offset = "0x0")]
			public AvatarFrameDataId id;

			// Token: 0x04000752 RID: 1874
			[Token(Token = "0x4000752")]
			[FieldOffset(Offset = "0x4")]
			public byte level;

			// Token: 0x04000753 RID: 1875
			[Token(Token = "0x4000753")]
			[FieldOffset(Offset = "0x6")]
			public ushort grade;
		}

		// Token: 0x0200021D RID: 541
		[Token(Token = "0x200021D")]
		[Serializable]
		public struct ProductPlacement : ICopiable<Account.ProductPlacement>
		{
			// Token: 0x0600044B RID: 1099 RVA: 0x00002624 File Offset: 0x00000824
			[Token(Token = "0x600044B")]
			[Address(RVA = "0x8C938A8", Offset = "0x8C8F8A8", VA = "0x8C938A8", Slot = "4")]
			public Account.ProductPlacement Copy()
			{
				return default(Account.ProductPlacement);
			}

			// Token: 0x0600044C RID: 1100 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x600044C")]
			[Address(RVA = "0x8C94E68", Offset = "0x8C90E68", VA = "0x8C94E68")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000754 RID: 1876
			[Token(Token = "0x4000754")]
			[FieldOffset(Offset = "0x0")]
			public PPID id;

			// Token: 0x04000755 RID: 1877
			[Token(Token = "0x4000755")]
			[FieldOffset(Offset = "0x4")]
			public ushort count;

			// Token: 0x04000756 RID: 1878
			[Token(Token = "0x4000756")]
			[FieldOffset(Offset = "0x6")]
			public ushort purchasesCount;
		}

		// Token: 0x0200021E RID: 542
		[Token(Token = "0x200021E")]
		[Serializable]
		public struct CustomKit : ICopiable<Account.CustomKit>
		{
			// Token: 0x0600044D RID: 1101 RVA: 0x0000263C File Offset: 0x0000083C
			[Token(Token = "0x600044D")]
			[Address(RVA = "0x8C938B0", Offset = "0x8C8F8B0", VA = "0x8C938B0", Slot = "4")]
			public Account.CustomKit Copy()
			{
				return default(Account.CustomKit);
			}

			// Token: 0x0600044E RID: 1102 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x600044E")]
			[Address(RVA = "0x8C94EBC", Offset = "0x8C90EBC", VA = "0x8C94EBC")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000757 RID: 1879
			[Token(Token = "0x4000757")]
			[FieldOffset(Offset = "0x0")]
			public PPID id;

			// Token: 0x04000758 RID: 1880
			[Token(Token = "0x4000758")]
			[FieldOffset(Offset = "0x8")]
			public Account.CustomKit.CustomKitHeroShardsItem[] shardsItems;

			// Token: 0x0200021F RID: 543
			[Token(Token = "0x200021F")]
			[Serializable]
			public struct CustomKitHeroShardsItem : ICopiable<Account.CustomKit.CustomKitHeroShardsItem>
			{
				// Token: 0x0600044F RID: 1103 RVA: 0x00002654 File Offset: 0x00000854
				[Token(Token = "0x600044F")]
				[Address(RVA = "0x8C95CB4", Offset = "0x8C91CB4", VA = "0x8C95CB4", Slot = "4")]
				public Account.CustomKit.CustomKitHeroShardsItem Copy()
				{
					return default(Account.CustomKit.CustomKitHeroShardsItem);
				}

				// Token: 0x06000450 RID: 1104 RVA: 0x00002066 File Offset: 0x00000266
				[Token(Token = "0x6000450")]
				[Address(RVA = "0x8C95CC8", Offset = "0x8C91CC8", VA = "0x8C95CC8")]
				public void Read(BinaryReader reader)
				{
				}

				// Token: 0x04000759 RID: 1881
				[Token(Token = "0x4000759")]
				[FieldOffset(Offset = "0x0")]
				public HeroId heroId;

				// Token: 0x0400075A RID: 1882
				[Token(Token = "0x400075A")]
				[FieldOffset(Offset = "0x4")]
				public ushort purchasesCount;
			}
		}

		// Token: 0x02000220 RID: 544
		[Token(Token = "0x2000220")]
		[Serializable]
		public struct Patch : ICopiable<Account.Patch>
		{
			// Token: 0x06000451 RID: 1105 RVA: 0x0000266C File Offset: 0x0000086C
			[Token(Token = "0x6000451")]
			[Address(RVA = "0x8C9397C", Offset = "0x8C8F97C", VA = "0x8C9397C", Slot = "4")]
			public Account.Patch Copy()
			{
				return default(Account.Patch);
			}

			// Token: 0x06000452 RID: 1106 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000452")]
			[Address(RVA = "0x8C94F88", Offset = "0x8C90F88", VA = "0x8C94F88")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400075B RID: 1883
			[Token(Token = "0x400075B")]
			[FieldOffset(Offset = "0x0")]
			public PatchId id;

			// Token: 0x0400075C RID: 1884
			[Token(Token = "0x400075C")]
			[FieldOffset(Offset = "0x4")]
			public uint count;
		}

		// Token: 0x02000221 RID: 545
		[Token(Token = "0x2000221")]
		[Serializable]
		public struct Event : ICopiable<Account.Event>
		{
			// Token: 0x06000453 RID: 1107 RVA: 0x00002684 File Offset: 0x00000884
			[Token(Token = "0x6000453")]
			[Address(RVA = "0x8C93984", Offset = "0x8C8F984", VA = "0x8C93984", Slot = "4")]
			public Account.Event Copy()
			{
				return default(Account.Event);
			}

			// Token: 0x06000454 RID: 1108 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000454")]
			[Address(RVA = "0x8C94FCC", Offset = "0x8C90FCC", VA = "0x8C94FCC")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400075D RID: 1885
			[Token(Token = "0x400075D")]
			[FieldOffset(Offset = "0x0")]
			public EventId id;

			// Token: 0x0400075E RID: 1886
			[Token(Token = "0x400075E")]
			[FieldOffset(Offset = "0x4")]
			public ushort? day;
		}

		// Token: 0x02000222 RID: 546
		[Token(Token = "0x2000222")]
		[Serializable]
		public struct VipShop : ICopiable<Account.VipShop>
		{
			// Token: 0x06000455 RID: 1109 RVA: 0x0000269C File Offset: 0x0000089C
			[Token(Token = "0x6000455")]
			[Address(RVA = "0x8C93A2C", Offset = "0x8C8FA2C", VA = "0x8C93A2C", Slot = "4")]
			public Account.VipShop Copy()
			{
				return default(Account.VipShop);
			}

			// Token: 0x06000456 RID: 1110 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000456")]
			[Address(RVA = "0x8C95078", Offset = "0x8C91078", VA = "0x8C95078")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400075F RID: 1887
			[Token(Token = "0x400075F")]
			[FieldOffset(Offset = "0x0")]
			public VipShopId id;

			// Token: 0x04000760 RID: 1888
			[Token(Token = "0x4000760")]
			[FieldOffset(Offset = "0x8")]
			public long vipCurrency;

			// Token: 0x04000761 RID: 1889
			[Token(Token = "0x4000761")]
			[FieldOffset(Offset = "0x10")]
			public Account.VipShop.PurchasedNode[] purchasedNodes;

			// Token: 0x04000762 RID: 1890
			[Token(Token = "0x4000762")]
			[FieldOffset(Offset = "0x18")]
			public long spendingCurrency;

			// Token: 0x02000223 RID: 547
			[Token(Token = "0x2000223")]
			[Serializable]
			public struct PurchasedNode : ICopiable<Account.VipShop.PurchasedNode>
			{
				// Token: 0x06000457 RID: 1111 RVA: 0x000026B4 File Offset: 0x000008B4
				[Token(Token = "0x6000457")]
				[Address(RVA = "0x8C95D08", Offset = "0x8C91D08", VA = "0x8C95D08", Slot = "4")]
				public Account.VipShop.PurchasedNode Copy()
				{
					return default(Account.VipShop.PurchasedNode);
				}

				// Token: 0x06000458 RID: 1112 RVA: 0x00002066 File Offset: 0x00000266
				[Token(Token = "0x6000458")]
				[Address(RVA = "0x8C95D18", Offset = "0x8C91D18", VA = "0x8C95D18")]
				public void Read(BinaryReader reader)
				{
				}

				// Token: 0x04000763 RID: 1891
				[Token(Token = "0x4000763")]
				[FieldOffset(Offset = "0x0")]
				public byte id;

				// Token: 0x04000764 RID: 1892
				[Token(Token = "0x4000764")]
				[FieldOffset(Offset = "0x1")]
				public byte count;

				// Token: 0x04000765 RID: 1893
				[Token(Token = "0x4000765")]
				[FieldOffset(Offset = "0x2")]
				public VipShopNodeRewardType type;
			}
		}

		// Token: 0x02000224 RID: 548
		[Token(Token = "0x2000224")]
		[Serializable]
		public struct RewardPassCell : ICopiable<Account.RewardPassCell>
		{
			// Token: 0x06000459 RID: 1113 RVA: 0x000026CC File Offset: 0x000008CC
			[Token(Token = "0x6000459")]
			[Address(RVA = "0x8C95D78", Offset = "0x8C91D78", VA = "0x8C95D78", Slot = "4")]
			public Account.RewardPassCell Copy()
			{
				return default(Account.RewardPassCell);
			}

			// Token: 0x0600045A RID: 1114 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x600045A")]
			[Address(RVA = "0x8C95D8C", Offset = "0x8C91D8C", VA = "0x8C95D8C")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000766 RID: 1894
			[Token(Token = "0x4000766")]
			[FieldOffset(Offset = "0x0")]
			public ushort levelId;

			// Token: 0x04000767 RID: 1895
			[Token(Token = "0x4000767")]
			[FieldOffset(Offset = "0x2")]
			public byte claimedRewardIndex;
		}

		// Token: 0x02000225 RID: 549
		[Token(Token = "0x2000225")]
		[Serializable]
		public struct RewardPassRow : ICopiable<Account.RewardPassRow>
		{
			// Token: 0x0600045B RID: 1115 RVA: 0x000026E4 File Offset: 0x000008E4
			[Token(Token = "0x600045B")]
			[Address(RVA = "0x8C95DD8", Offset = "0x8C91DD8", VA = "0x8C95DD8", Slot = "4")]
			public Account.RewardPassRow Copy()
			{
				return default(Account.RewardPassRow);
			}

			// Token: 0x0600045C RID: 1116 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x600045C")]
			[Address(RVA = "0x8C95F6C", Offset = "0x8C91F6C", VA = "0x8C95F6C")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000768 RID: 1896
			[Token(Token = "0x4000768")]
			[FieldOffset(Offset = "0x0")]
			public byte rowId;

			// Token: 0x04000769 RID: 1897
			[Token(Token = "0x4000769")]
			[FieldOffset(Offset = "0x8")]
			public Account.RewardPassCell[] claimedCells;

			// Token: 0x0400076A RID: 1898
			[Token(Token = "0x400076A")]
			[FieldOffset(Offset = "0x10")]
			public Account.RewardPassCell[] claimedExtraCells;

			// Token: 0x0400076B RID: 1899
			[Token(Token = "0x400076B")]
			[FieldOffset(Offset = "0x18")]
			public ushort claimedExtraLevelCyclesCount;
		}

		// Token: 0x02000226 RID: 550
		[Token(Token = "0x2000226")]
		[Serializable]
		public struct RewardPass : ICopiable<Account.RewardPass>
		{
			// Token: 0x0600045D RID: 1117 RVA: 0x000026FC File Offset: 0x000008FC
			[Token(Token = "0x600045D")]
			[Address(RVA = "0x8C93B1C", Offset = "0x8C8FB1C", VA = "0x8C93B1C", Slot = "4")]
			public Account.RewardPass Copy()
			{
				return default(Account.RewardPass);
			}

			// Token: 0x0600045E RID: 1118 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x600045E")]
			[Address(RVA = "0x8C95174", Offset = "0x8C91174", VA = "0x8C95174")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400076C RID: 1900
			[Token(Token = "0x400076C")]
			[FieldOffset(Offset = "0x0")]
			public RewardPassDataId id;

			// Token: 0x0400076D RID: 1901
			[Token(Token = "0x400076D")]
			[FieldOffset(Offset = "0x4")]
			public uint progress;

			// Token: 0x0400076E RID: 1902
			[Token(Token = "0x400076E")]
			[FieldOffset(Offset = "0x8")]
			public Account.RewardPassRow[] rows;
		}

		// Token: 0x02000227 RID: 551
		[Token(Token = "0x2000227")]
		[Serializable]
		public struct ProgressiveKit : ICopiable<Account.ProgressiveKit>
		{
			// Token: 0x0600045F RID: 1119 RVA: 0x00002714 File Offset: 0x00000914
			[Token(Token = "0x600045F")]
			[Address(RVA = "0x8C93C0C", Offset = "0x8C8FC0C", VA = "0x8C93C0C", Slot = "4")]
			public Account.ProgressiveKit Copy()
			{
				return default(Account.ProgressiveKit);
			}

			// Token: 0x06000460 RID: 1120 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000460")]
			[Address(RVA = "0x8C95258", Offset = "0x8C91258", VA = "0x8C95258")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400076F RID: 1903
			[Token(Token = "0x400076F")]
			[FieldOffset(Offset = "0x0")]
			public uint id;

			// Token: 0x04000770 RID: 1904
			[Token(Token = "0x4000770")]
			[FieldOffset(Offset = "0x8")]
			public byte[] claimedRewardsVariantsIndexes;
		}

		// Token: 0x02000228 RID: 552
		[Token(Token = "0x2000228")]
		[Serializable]
		public struct RateMe : ICopiable<Account.RateMe>
		{
			// Token: 0x06000461 RID: 1121 RVA: 0x0000272C File Offset: 0x0000092C
			[Token(Token = "0x6000461")]
			[Address(RVA = "0x8C93CD4", Offset = "0x8C8FCD4", VA = "0x8C93CD4", Slot = "4")]
			public Account.RateMe Copy()
			{
				return default(Account.RateMe);
			}

			// Token: 0x06000462 RID: 1122 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000462")]
			[Address(RVA = "0x8C95334", Offset = "0x8C91334", VA = "0x8C95334")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000771 RID: 1905
			[Token(Token = "0x4000771")]
			[FieldOffset(Offset = "0x0")]
			public bool isTimerInactive;

			// Token: 0x04000772 RID: 1906
			[Token(Token = "0x4000772")]
			[FieldOffset(Offset = "0x1")]
			public byte ratedPlacements;

			// Token: 0x04000773 RID: 1907
			[Token(Token = "0x4000773")]
			[FieldOffset(Offset = "0x2")]
			public ushort version;
		}

		// Token: 0x02000229 RID: 553
		[Token(Token = "0x2000229")]
		[Serializable]
		public struct ScheduleEntry : ICopiable<Account.ScheduleEntry>
		{
			// Token: 0x06000463 RID: 1123 RVA: 0x00002744 File Offset: 0x00000944
			[Token(Token = "0x6000463")]
			[Address(RVA = "0x8C93CDC", Offset = "0x8C8FCDC", VA = "0x8C93CDC", Slot = "4")]
			public Account.ScheduleEntry Copy()
			{
				return default(Account.ScheduleEntry);
			}

			// Token: 0x06000464 RID: 1124 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000464")]
			[Address(RVA = "0x8C95398", Offset = "0x8C91398", VA = "0x8C95398")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000774 RID: 1908
			[Token(Token = "0x4000774")]
			[FieldOffset(Offset = "0x0")]
			public uint entryId;

			// Token: 0x04000775 RID: 1909
			[Token(Token = "0x4000775")]
			[FieldOffset(Offset = "0x4")]
			public uint startTimestamp;
		}

		// Token: 0x0200022A RID: 554
		[Token(Token = "0x200022A")]
		[Serializable]
		public struct GameplayEventData : ICopiable<Account.GameplayEventData>
		{
			// Token: 0x06000465 RID: 1125 RVA: 0x0000275C File Offset: 0x0000095C
			[Token(Token = "0x6000465")]
			[Address(RVA = "0x8C93CE4", Offset = "0x8C8FCE4", VA = "0x8C93CE4", Slot = "4")]
			public Account.GameplayEventData Copy()
			{
				return default(Account.GameplayEventData);
			}

			// Token: 0x06000466 RID: 1126 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000466")]
			[Address(RVA = "0x8C953EC", Offset = "0x8C913EC", VA = "0x8C953EC")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000776 RID: 1910
			[Token(Token = "0x4000776")]
			[FieldOffset(Offset = "0x0")]
			public GameplayEventType type;

			// Token: 0x04000777 RID: 1911
			[Token(Token = "0x4000777")]
			[FieldOffset(Offset = "0x2")]
			public ushort comboId;

			// Token: 0x04000778 RID: 1912
			[Token(Token = "0x4000778")]
			[FieldOffset(Offset = "0x4")]
			public bool rewardIsClaimed;

			// Token: 0x04000779 RID: 1913
			[Token(Token = "0x4000779")]
			[FieldOffset(Offset = "0x5")]
			public byte competedTauntsCount;
		}

		// Token: 0x0200022B RID: 555
		[Token(Token = "0x200022B")]
		[Serializable]
		public struct Marathon : ICopiable<Account.Marathon>
		{
			// Token: 0x06000467 RID: 1127 RVA: 0x00002774 File Offset: 0x00000974
			[Token(Token = "0x6000467")]
			[Address(RVA = "0x8C93D08", Offset = "0x8C8FD08", VA = "0x8C93D08", Slot = "4")]
			public Account.Marathon Copy()
			{
				return default(Account.Marathon);
			}

			// Token: 0x06000468 RID: 1128 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000468")]
			[Address(RVA = "0x8C9546C", Offset = "0x8C9146C", VA = "0x8C9546C")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400077A RID: 1914
			[Token(Token = "0x400077A")]
			[FieldOffset(Offset = "0x0")]
			public MarathonId id;

			// Token: 0x0400077B RID: 1915
			[Token(Token = "0x400077B")]
			[FieldOffset(Offset = "0x8")]
			public byte[] claimedRewardsVariantsIndexes;

			// Token: 0x0400077C RID: 1916
			[Token(Token = "0x400077C")]
			[FieldOffset(Offset = "0x10")]
			public uint lastRewardClaimTime;
		}

		// Token: 0x0200022C RID: 556
		[Token(Token = "0x200022C")]
		[Serializable]
		public struct PiggyBank : ICopiable<Account.PiggyBank>
		{
			// Token: 0x06000469 RID: 1129 RVA: 0x0000278C File Offset: 0x0000098C
			[Token(Token = "0x6000469")]
			[Address(RVA = "0x8C93DDC", Offset = "0x8C8FDDC", VA = "0x8C93DDC", Slot = "4")]
			public Account.PiggyBank Copy()
			{
				return default(Account.PiggyBank);
			}

			// Token: 0x0600046A RID: 1130 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x600046A")]
			[Address(RVA = "0x8C95554", Offset = "0x8C91554", VA = "0x8C95554")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400077D RID: 1917
			[Token(Token = "0x400077D")]
			[FieldOffset(Offset = "0x0")]
			public PiggyBankId id;

			// Token: 0x0400077E RID: 1918
			[Token(Token = "0x400077E")]
			[FieldOffset(Offset = "0x4")]
			public ushort progress;

			// Token: 0x0400077F RID: 1919
			[Token(Token = "0x400077F")]
			[FieldOffset(Offset = "0x8")]
			public uint timestamp;
		}

		// Token: 0x0200022D RID: 557
		[Token(Token = "0x200022D")]
		[Serializable]
		public struct Expenses : ICopiable<Account.Expenses>
		{
			// Token: 0x0600046B RID: 1131 RVA: 0x000027A4 File Offset: 0x000009A4
			[Token(Token = "0x600046B")]
			[Address(RVA = "0x8C92E1C", Offset = "0x8C8EE1C", VA = "0x8C92E1C", Slot = "4")]
			public Account.Expenses Copy()
			{
				return default(Account.Expenses);
			}

			// Token: 0x0600046C RID: 1132 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x600046C")]
			[Address(RVA = "0x8C9435C", Offset = "0x8C9035C", VA = "0x8C9435C")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000780 RID: 1920
			[Token(Token = "0x4000780")]
			[FieldOffset(Offset = "0x0")]
			public uint avgMonthlyExpenses;

			// Token: 0x04000781 RID: 1921
			[Token(Token = "0x4000781")]
			[FieldOffset(Offset = "0x4")]
			public uint lastMonthExpenses;

			// Token: 0x04000782 RID: 1922
			[Token(Token = "0x4000782")]
			[FieldOffset(Offset = "0x8")]
			public uint? lastPurchaseUnixDate;
		}

		// Token: 0x0200022E RID: 558
		[Token(Token = "0x200022E")]
		[Serializable]
		public struct GachaKit : ICopiable<Account.GachaKit>
		{
			// Token: 0x0600046D RID: 1133 RVA: 0x000027BC File Offset: 0x000009BC
			[Token(Token = "0x600046D")]
			[Address(RVA = "0x8C93DF4", Offset = "0x8C8FDF4", VA = "0x8C93DF4", Slot = "4")]
			public Account.GachaKit Copy()
			{
				return default(Account.GachaKit);
			}

			// Token: 0x0600046E RID: 1134 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x600046E")]
			[Address(RVA = "0x8C955AC", Offset = "0x8C915AC", VA = "0x8C955AC")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000783 RID: 1923
			[Token(Token = "0x4000783")]
			[FieldOffset(Offset = "0x0")]
			public ushort id;

			// Token: 0x04000784 RID: 1924
			[Token(Token = "0x4000784")]
			[FieldOffset(Offset = "0x8")]
			public ushort[] purchasedIds;
		}

		// Token: 0x0200022F RID: 559
		[Token(Token = "0x200022F")]
		[Serializable]
		public struct GachaToken : ICopiable<Account.GachaToken>
		{
			// Token: 0x0600046F RID: 1135 RVA: 0x000027D4 File Offset: 0x000009D4
			[Token(Token = "0x600046F")]
			[Address(RVA = "0x8C93EB8", Offset = "0x8C8FEB8", VA = "0x8C93EB8", Slot = "4")]
			public Account.GachaToken Copy()
			{
				return default(Account.GachaToken);
			}

			// Token: 0x06000470 RID: 1136 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000470")]
			[Address(RVA = "0x8C95684", Offset = "0x8C91684", VA = "0x8C95684")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000785 RID: 1925
			[Token(Token = "0x4000785")]
			[FieldOffset(Offset = "0x0")]
			public GachaTokenDataId id;

			// Token: 0x04000786 RID: 1926
			[Token(Token = "0x4000786")]
			[FieldOffset(Offset = "0x4")]
			public uint amount;
		}

		// Token: 0x02000230 RID: 560
		[Token(Token = "0x2000230")]
		[Serializable]
		public struct RewardSquare : ICopiable<Account.RewardSquare>
		{
			// Token: 0x06000471 RID: 1137 RVA: 0x000027EC File Offset: 0x000009EC
			[Token(Token = "0x6000471")]
			[Address(RVA = "0x8C93EC0", Offset = "0x8C8FEC0", VA = "0x8C93EC0", Slot = "4")]
			public Account.RewardSquare Copy()
			{
				return default(Account.RewardSquare);
			}

			// Token: 0x06000472 RID: 1138 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000472")]
			[Address(RVA = "0x8C956C8", Offset = "0x8C916C8", VA = "0x8C956C8")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000787 RID: 1927
			[Token(Token = "0x4000787")]
			[FieldOffset(Offset = "0x0")]
			public ushort id;

			// Token: 0x04000788 RID: 1928
			[Token(Token = "0x4000788")]
			[FieldOffset(Offset = "0x8")]
			public Account.RewardSquare.Cell[] purchasedCells;

			// Token: 0x02000231 RID: 561
			[Token(Token = "0x2000231")]
			[Serializable]
			public struct Cell : ICopiable<Account.RewardSquare.Cell>
			{
				// Token: 0x06000473 RID: 1139 RVA: 0x00002804 File Offset: 0x00000A04
				[Token(Token = "0x6000473")]
				[Address(RVA = "0x8C960B8", Offset = "0x8C920B8", VA = "0x8C960B8", Slot = "4")]
				public Account.RewardSquare.Cell Copy()
				{
					return default(Account.RewardSquare.Cell);
				}

				// Token: 0x06000474 RID: 1140 RVA: 0x00002066 File Offset: 0x00000266
				[Token(Token = "0x6000474")]
				[Address(RVA = "0x8C960CC", Offset = "0x8C920CC", VA = "0x8C960CC")]
				public void Read(BinaryReader reader)
				{
				}

				// Token: 0x04000789 RID: 1929
				[Token(Token = "0x4000789")]
				[FieldOffset(Offset = "0x0")]
				public ushort id;

				// Token: 0x0400078A RID: 1930
				[Token(Token = "0x400078A")]
				[FieldOffset(Offset = "0x2")]
				public byte rewardIndex;
			}
		}

		// Token: 0x02000232 RID: 562
		[Token(Token = "0x2000232")]
		[Serializable]
		public struct FreeGoods : ICopiable<Account.FreeGoods>
		{
			// Token: 0x06000475 RID: 1141 RVA: 0x0000281C File Offset: 0x00000A1C
			[Token(Token = "0x6000475")]
			[Address(RVA = "0x8C96118", Offset = "0x8C92118", VA = "0x8C96118", Slot = "4")]
			public Account.FreeGoods Copy()
			{
				return default(Account.FreeGoods);
			}

			// Token: 0x06000476 RID: 1142 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000476")]
			[Address(RVA = "0x8C96120", Offset = "0x8C92120", VA = "0x8C96120")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400078B RID: 1931
			[Token(Token = "0x400078B")]
			[FieldOffset(Offset = "0x0")]
			public ushort id;

			// Token: 0x0400078C RID: 1932
			[Token(Token = "0x400078C")]
			[FieldOffset(Offset = "0x2")]
			public ushort amount;

			// Token: 0x0400078D RID: 1933
			[Token(Token = "0x400078D")]
			[FieldOffset(Offset = "0x4")]
			public uint nextUpdateTimestamp;
		}

		// Token: 0x02000233 RID: 563
		[Token(Token = "0x2000233")]
		[Serializable]
		public struct GiftsToPlayers : ICopiable<Account.GiftsToPlayers>
		{
			// Token: 0x06000477 RID: 1143 RVA: 0x00002834 File Offset: 0x00000A34
			[Token(Token = "0x6000477")]
			[Address(RVA = "0x8C96184", Offset = "0x8C92184", VA = "0x8C96184", Slot = "4")]
			public Account.GiftsToPlayers Copy()
			{
				return default(Account.GiftsToPlayers);
			}

			// Token: 0x06000478 RID: 1144 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000478")]
			[Address(RVA = "0x8C9624C", Offset = "0x8C9224C", VA = "0x8C9624C")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400078E RID: 1934
			[Token(Token = "0x400078E")]
			[FieldOffset(Offset = "0x0")]
			public ushort goodId;

			// Token: 0x0400078F RID: 1935
			[Token(Token = "0x400078F")]
			[FieldOffset(Offset = "0x8")]
			public string[] playerIds;
		}

		// Token: 0x02000234 RID: 564
		[Token(Token = "0x2000234")]
		[Serializable]
		public struct GoodsSet : ICopiable<Account.GoodsSet>
		{
			// Token: 0x06000479 RID: 1145 RVA: 0x0000284C File Offset: 0x00000A4C
			[Token(Token = "0x6000479")]
			[Address(RVA = "0x8C93F8C", Offset = "0x8C8FF8C", VA = "0x8C93F8C", Slot = "4")]
			public Account.GoodsSet Copy()
			{
				return default(Account.GoodsSet);
			}

			// Token: 0x0600047A RID: 1146 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x600047A")]
			[Address(RVA = "0x8C95798", Offset = "0x8C91798", VA = "0x8C95798")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000790 RID: 1936
			[Token(Token = "0x4000790")]
			[FieldOffset(Offset = "0x0")]
			public PPID id;

			// Token: 0x04000791 RID: 1937
			[Token(Token = "0x4000791")]
			[FieldOffset(Offset = "0x8")]
			public Account.FreeGoods[] freeGoods;

			// Token: 0x04000792 RID: 1938
			[Token(Token = "0x4000792")]
			[FieldOffset(Offset = "0x10")]
			public Account.GiftsToPlayers[] giftsToPlayers;
		}

		// Token: 0x02000235 RID: 565
		[Token(Token = "0x2000235")]
		[Serializable]
		public struct EventCurrency : ICopiable<Account.EventCurrency>
		{
			// Token: 0x0600047B RID: 1147 RVA: 0x00002864 File Offset: 0x00000A64
			[Token(Token = "0x600047B")]
			[Address(RVA = "0x8C92D10", Offset = "0x8C8ED10", VA = "0x8C92D10", Slot = "4")]
			public Account.EventCurrency Copy()
			{
				return default(Account.EventCurrency);
			}

			// Token: 0x0600047C RID: 1148 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x600047C")]
			[Address(RVA = "0x8C94174", Offset = "0x8C90174", VA = "0x8C94174")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000793 RID: 1939
			[Token(Token = "0x4000793")]
			[FieldOffset(Offset = "0x0")]
			public EventCurrencyId id;

			// Token: 0x04000794 RID: 1940
			[Token(Token = "0x4000794")]
			[FieldOffset(Offset = "0x8")]
			public long amount;

			// Token: 0x04000795 RID: 1941
			[Token(Token = "0x4000795")]
			[FieldOffset(Offset = "0x10")]
			public long spent;

			// Token: 0x04000796 RID: 1942
			[Token(Token = "0x4000796")]
			[FieldOffset(Offset = "0x18")]
			public long total;

			// Token: 0x04000797 RID: 1943
			[Token(Token = "0x4000797")]
			[FieldOffset(Offset = "0x20")]
			public EventCurrencyBoostId[] activeBoostIds;
		}

		// Token: 0x02000236 RID: 566
		[Token(Token = "0x2000236")]
		[Serializable]
		public struct EventSpecialCurrency : ICopiable<Account.EventSpecialCurrency>
		{
			// Token: 0x0600047D RID: 1149 RVA: 0x0000287C File Offset: 0x00000A7C
			[Token(Token = "0x600047D")]
			[Address(RVA = "0x8C92D00", Offset = "0x8C8ED00", VA = "0x8C92D00", Slot = "4")]
			public Account.EventSpecialCurrency Copy()
			{
				return default(Account.EventSpecialCurrency);
			}

			// Token: 0x0600047E RID: 1150 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x600047E")]
			[Address(RVA = "0x8C94130", Offset = "0x8C90130", VA = "0x8C94130")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x04000798 RID: 1944
			[Token(Token = "0x4000798")]
			[FieldOffset(Offset = "0x0")]
			public EventSpecialCurrencyId id;

			// Token: 0x04000799 RID: 1945
			[Token(Token = "0x4000799")]
			[FieldOffset(Offset = "0x8")]
			public long amount;
		}

		// Token: 0x02000237 RID: 567
		[Token(Token = "0x2000237")]
		[Serializable]
		public struct CurrencySpendingBonus : ICopiable<Account.CurrencySpendingBonus>
		{
			// Token: 0x0600047F RID: 1151 RVA: 0x00002894 File Offset: 0x00000A94
			[Token(Token = "0x600047F")]
			[Address(RVA = "0x8C92E00", Offset = "0x8C8EE00", VA = "0x8C92E00", Slot = "4")]
			public Account.CurrencySpendingBonus Copy()
			{
				return default(Account.CurrencySpendingBonus);
			}

			// Token: 0x06000480 RID: 1152 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000480")]
			[Address(RVA = "0x8C9428C", Offset = "0x8C9028C", VA = "0x8C9428C")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400079A RID: 1946
			[Token(Token = "0x400079A")]
			[FieldOffset(Offset = "0x0")]
			public CurrencySpendingBonusId id;

			// Token: 0x0400079B RID: 1947
			[Token(Token = "0x400079B")]
			[FieldOffset(Offset = "0x8")]
			public long bonusProgress;

			// Token: 0x0400079C RID: 1948
			[Token(Token = "0x400079C")]
			[FieldOffset(Offset = "0x10")]
			public long bonusProgressClaimed;
		}

		// Token: 0x02000238 RID: 568
		[Token(Token = "0x2000238")]
		[Serializable]
		public struct BanInfo : ICopiable<Account.BanInfo>
		{
			// Token: 0x06000481 RID: 1153 RVA: 0x000028AC File Offset: 0x00000AAC
			[Token(Token = "0x6000481")]
			[Address(RVA = "0x8C9410C", Offset = "0x8C9010C", VA = "0x8C9410C", Slot = "4")]
			public Account.BanInfo Copy()
			{
				return default(Account.BanInfo);
			}

			// Token: 0x06000482 RID: 1154 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000482")]
			[Address(RVA = "0x8C95920", Offset = "0x8C91920", VA = "0x8C95920")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x0400079D RID: 1949
			[Token(Token = "0x400079D")]
			[FieldOffset(Offset = "0x0")]
			public MatchType matchType;

			// Token: 0x0400079E RID: 1950
			[Token(Token = "0x400079E")]
			[FieldOffset(Offset = "0x4")]
			public uint bannedUntil;

			// Token: 0x0400079F RID: 1951
			[Token(Token = "0x400079F")]
			[FieldOffset(Offset = "0x8")]
			public Account.BanReason banReason;
		}

		// Token: 0x02000239 RID: 569
		[Token(Token = "0x2000239")]
		[Serializable]
		public struct CommunityGoalInfo : ICopiable<Account.CommunityGoalInfo>
		{
			// Token: 0x06000483 RID: 1155 RVA: 0x000028C4 File Offset: 0x00000AC4
			[Token(Token = "0x6000483")]
			[Address(RVA = "0x8C940F8", Offset = "0x8C900F8", VA = "0x8C940F8", Slot = "4")]
			public Account.CommunityGoalInfo Copy()
			{
				return default(Account.CommunityGoalInfo);
			}

			// Token: 0x06000484 RID: 1156 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000484")]
			[Address(RVA = "0x8C958E0", Offset = "0x8C918E0", VA = "0x8C958E0")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x040007A0 RID: 1952
			[Token(Token = "0x40007A0")]
			[FieldOffset(Offset = "0x0")]
			public CommunityGoalId id;

			// Token: 0x040007A1 RID: 1953
			[Token(Token = "0x40007A1")]
			[FieldOffset(Offset = "0x4")]
			public byte stagesCount;
		}

		// Token: 0x0200023A RID: 570
		[Token(Token = "0x200023A")]
		[Serializable]
		public struct CollectibleWeaponCompensationTokenInfo : ICopiable<Account.CollectibleWeaponCompensationTokenInfo>
		{
			// Token: 0x06000485 RID: 1157 RVA: 0x000028DC File Offset: 0x00000ADC
			[Token(Token = "0x6000485")]
			[Address(RVA = "0x8C94124", Offset = "0x8C90124", VA = "0x8C94124", Slot = "4")]
			public Account.CollectibleWeaponCompensationTokenInfo Copy()
			{
				return default(Account.CollectibleWeaponCompensationTokenInfo);
			}

			// Token: 0x06000486 RID: 1158 RVA: 0x00002066 File Offset: 0x00000266
			[Token(Token = "0x6000486")]
			[Address(RVA = "0x8C95984", Offset = "0x8C91984", VA = "0x8C95984")]
			public void Read(BinaryReader reader)
			{
			}

			// Token: 0x040007A2 RID: 1954
			[Token(Token = "0x40007A2")]
			[FieldOffset(Offset = "0x0")]
			public WeaponClassFilter weaponClassFilter;

			// Token: 0x040007A3 RID: 1955
			[Token(Token = "0x40007A3")]
			[FieldOffset(Offset = "0x4")]
			public uint expireTime;

			// Token: 0x040007A4 RID: 1956
			[Token(Token = "0x40007A4")]
			[FieldOffset(Offset = "0x8")]
			public bool isUsed;
		}
	}
}
