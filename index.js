const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const express = require('express');

// --- Servidor Web para Render e UptimeRobot ---
const app = express();
app.get('/', (req, res) => res.send('Sistema RH Tabacudos Online!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
// ----------------------------------------------

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Usando variáveis de ambiente (Segurança para o GitHub)
const TOKEN = process.env.TOKEN; 

// ID do Canal fixado manualmente no código
const CANAL_LOGS_ID = '1552361514629865542';

client.once('ready', () => {
    console.log(`Bot online como ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.content === '!setup_adv') {
        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('abrir_form_adv')
                .setLabel('Registrar Advertência')
                .setEmoji('⚠️')
                .setStyle(ButtonStyle.Danger)
        );

        await message.channel.send({
            content: '**Painel de Advertências - Tabacudos**\nClique no botão abaixo para preencher um novo registro.',
            components: [button]
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === 'abrir_form_adv') {
            const modal = new ModalBuilder()
                .setCustomId('modal_adv')
                .setTitle('Registro de Advertência');

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
                .setLabel('Motivo e Penalidade')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(nomeInput),
                new ActionRowBuilder().addComponents(idInput),
                new ActionRowBuilder().addComponents(avisoInput),
                new ActionRowBuilder().addComponents(motivoInput)
            );

            await interaction.showModal(modal);
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'modal_adv') {
            const nome = interaction.fields.getTextInputValue('nome_func');
            const idFunc = interaction.fields.getTextInputValue('id_func');
            const aviso = interaction.fields.getTextInputValue('aviso_nivel');
            const motivo = interaction.fields.getTextInputValue('motivo_adv');
            const responsavel = interaction.user;

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⚠️ REGISTRO DE ADVERTÊNCIA ⚠️')
                .addFields(
                    { name: '👤 Funcionário', value: `${nome} | **ID:** ${idFunc}`, inline: false },
                    { name: '🛡️ Responsável', value: `${responsavel}`, inline: false },
                    { name: '🚨 Aviso', value: `[ ${aviso} ]`, inline: false },
                    { name: '📋 Motivo e Penalidade', value: motivo, inline: false }
                )
                .setFooter({ text: 'Tabacudos Restaurante - Sistema de RH' })
                .setTimestamp();

            try {
                // Modificado para fetch para forçar a busca do canal
                const canal = await client.channels.fetch(CANAL_LOGS_ID);
                if (canal) {
                    await canal.send({ embeds: [embed] });
                    // Fecha o pop-up silenciosamente sem enviar mensagem extra
                    await interaction.deferUpdate();
                }
            } catch (error) {
                console.error(error);
                // Exibe erro apenas se a interação ainda não tiver sido respondida/fechada
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: 'Erro: O bot não tem permissão de "Ver Canal" e "Enviar Mensagens" no canal especificado.', ephemeral: true });
                }
            }
        }
    }
});

client.login(TOKEN);
