const {
  Client,
  GatewayIntentBits,
  Partials,
  SlashCommandBuilder,
  Routes,
  REST,
} = require("discord.js");
require("dotenv").config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

// 🔧 슬래시 커맨드 등록
const commands = [
  new SlashCommandBuilder()
    .setName("추첨")
    .setDescription("무작위로 유저를 추첨합니다.")
    .addIntegerOption((option) =>
      option
        .setName("인원수")
        .setDescription("추첨할 인원 수 (기본값: 1)")
        .setMinValue(1)
        .setRequired(false),
    )
    .addUserOption((option) =>
      option.setName("대상1").setDescription("첫 번째 대상").setRequired(false),
    )
    .addUserOption((option) =>
      option.setName("대상2").setDescription("두 번째 대상").setRequired(false),
    )
    .addUserOption((option) =>
      option.setName("대상3").setDescription("세 번째 대상").setRequired(false),
    )
    .addUserOption((option) =>
      option.setName("대상4").setDescription("네 번째 대상").setRequired(false),
    )
    .addUserOption((option) =>
      option
        .setName("대상5")
        .setDescription("다섯 번째 대상")
        .setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("롤지역")
    .setDescription("무작위 롤 지역을 추천합니다."),
  new SlashCommandBuilder()
    .setName("일김봇상태")
    .setDescription("봇이 자고 있는지 확인합니다."),
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);
(async () => {
  try {
    console.log("📡 커맨드 등록 중...");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log("✅ 슬래시 커맨드 등록 완료");
  } catch (err) {
    console.error("❌ 명령어 등록 실패:", err);
  }
})();

client.on("ready", () => {
  console.log(`🤖 로그인됨: ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "추첨") {
    const count = interaction.options.getInteger("인원수") || 1;

    let candidates = [];

    for (let i = 1; i <= 5; i++) {
      const user = interaction.options.getUser(`대상${i}`);
      if (user && !user.bot) {
        candidates.push(user);
      }
    }

    if (candidates.length === 0) {
      const allMembers = await interaction.guild.members.fetch();
      candidates = allMembers.filter((m) => !m.user.bot).map((m) => m.user);
    }

    console.log(
      "🎯 후보자 목록:",
      candidates.map((u) => u.tag),
    );

    if (candidates.length < count) {
      return interaction.reply(`❗ 추첨 대상 인원이 ${count}명보다 적습니다.`);
    }

    const winners = [];
    const pool = [...candidates];
    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * pool.length);
      winners.push(pool.splice(index, 1)[0]);
    }

    const winnerNames = winners.map((u) => `<@${u.id}>`).join(", ");
    await interaction.reply(`🎉 **추첨 결과**: ${winnerNames}`);
  } else if (interaction.commandName === "롤지역") {
    const regions = [
      "아이오니아",
      "룬테라",
      "타곤 # 프렐요드",
      "벤들 # 녹서스",
      "자운 # 이쉬탈",
      "데마시아 # 빌지워터",
      "그림자 군도 # 필트오버",
    ];
    const selected = regions[Math.floor(Math.random() * regions.length)];
    await interaction.reply(`🎲 선택된 지역은 **${selected}** 입니다!`);
  } else if (interaction.commandName === "일김봇상태") {
    await interaction.reply("봇이 자고 있어서 반응이 느릴 수 있어요 😴");
  }
});

client.login(TOKEN);
