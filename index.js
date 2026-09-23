const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');

// Configuração base do bot
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// VARIAVEIS IMPORTANTES - SUBSTITUIR AQUI
const TOKEN = 'TEU_TOKEN_AQUI'; 
const CANAL_LOGS_ID = 'ID_DO_CANAL_AQUI'; // ID do canal onde o registo vai ficar guardado

client.once('ready', () => {
    console.log(`Bot online como ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    // Comando para gerar o botão (escreve isto no canal de advertências para fixar o botão)
    if (message.content === '!setup_adv') {
        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('abrir_form_adv')
                .setLabel('Registar Advertência')
                .setEmoji('⚠️')
                .setStyle(ButtonStyle.Danger)
        );

        await message.channel.send({
            content: '**Painel de Advertências - Tabacudos**\nClica no botão abaixo para preencher um novo registo.',
            components: [button]
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    // Quando clicam no botão
    if (interaction.isButton()) {
        if (interaction.customId === 'abrir_form_adv') {
            const modal = new ModalBuilder()
                .setCustomId('modal_adv')
                .setTitle('Registo de Advertência');

            const nomeInput = new TextInputBuilder()
                .setCustomId('nome_func')
                .setLabel('Nome do Funcionário')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const idInput = new TextInputBuilder()
                .setCustomId('id_func')
                .setLabel('ID (Passaporte)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const avisoInput = new TextInputBuilder()
                .setCustomId('aviso_nivel')
                .setLabel('Aviso (Ex: 1/3)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const motivoInput = new TextInputBuilder()
                .setCustomId('motivo_adv')
                .setLabel('Motivo e Penalidade Aplicada')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            // Adicionar os campos ao Pop-up (cada campo precisa da sua própria ActionRow)
            modal.addComponents(
                new ActionRowBuilder().addComponents(nomeInput),
                new ActionRowBuilder().addComponents(idInput),
                new ActionRowBuilder().addComponents(avisoInput),
                new ActionRowBuilder().addComponents(motivoInput)
            );

            await interaction.showModal(modal);
        }
    }

    // Quando enviam o formulário preenchido
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'modal_adv') {
            const nome = interaction.fields.getTextInputValue('nome_func');
            const idFunc = interaction.fields.getTextInputValue('id_func');
            const aviso = interaction.fields.getTextInputValue('aviso_nivel');
            const motivo = interaction.fields.getTextInputValue('motivo_adv');
            const responsavel = interaction.user;

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⚠️ REGISTO DE ADVERTÊNCIA ⚠️')
                .addFields(
                    { name: '👤 Funcionário', value: `${nome} | **ID:** ${idFunc}`, inline: false },
                    { name: '🛡️ Responsável', value: `${responsavel}`, inline: false },
                    { name: '🚨 Aviso', value: `[ ${aviso} ]`, inline: false },
                    { name: '📋 Motivo e Penalidade', value: motivo, inline: false }
                )
                .setFooter({ text: 'Tabacudos Restaurante - Sistema de RH' })
                .setTimestamp();

            const canal = client.channels.cache.get(CANAL_LOGS_ID);
            if (canal) {
                await canal.send({ embeds: [embed] });
                await interaction.reply({ content: 'Advertência registada com sucesso no canal!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Erro: O canal de destino não foi encontrado. Verifica o ID.', ephemeral: true });
            }
        }
    }
});

client.login(TOKEN);
